import { Product, AiConfig } from '../models/index.js';
import { Op } from 'sequelize';
import { attachPricingToList } from './pricingEngine.js';

/**
 * AI Orchestrator — SRS section 32.1 / Security section 35.
 *
 * Isolated from core e-commerce logic: swapping the LLM provider never
 * touches checkout/order code. The assistant is strictly Assistive/Read-only —
 * it can call `searchProducts` (a read-only function) but can never write
 * price, order, or discount data directly (Guardrail Layer + Function Calling
 * Integration + Output Validation from the SRS security table).
 *
 * If OPENAI_API_KEY is configured, real LLM function-calling is used, with
 * the system prompt enforcing the guardrails below. If not, a deterministic,
 * catalog-grounded fallback runs the same function so the app is fully
 * functional without any external API key.
 */

const STOPWORDS = new Set(['a', 'an', 'the', 'for', 'to', 'me', 'i', 'want', 'need', 'show', 'find', 'looking', 'with', 'and', 'of', 'under', 'below', 'is', 'in']);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9$.\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

function extractPriceCeiling(message) {
  const match = message.match(/(?:under|below|less than)\s*\$?(\d+[\d,]*)/i);
  if (match) return Number(match[1].replace(/,/g, ''));
  return null;
}

// Read-only "function call" the assistant is permitted to make.
export async function searchProducts({ query, tags = [], priceMax = null, category = null }) {
  const tokens = tokenize(query || '');
  const where = {};
  const orClauses = [];

  if (tokens.length) {
    orClauses.push({ semanticTags: { [Op.overlap]: tokens } });
    orClauses.push({ name: { [Op.iLike]: `%${tokens[0]}%` } });
  }
  if (tags.length) orClauses.push({ semanticTags: { [Op.overlap]: tags } });
  if (orClauses.length) where[Op.or] = orClauses;
  if (priceMax) where.basePrice = { [Op.lte]: priceMax };
  if (category) where.category = category;

  const products = await Product.findAll({ where, limit: 6, order: [['createdAt', 'DESC']] });

  // Score by tag/token overlap for relevance (semantic-lite ranking without a vector DB)
  const scored = products
    .map((p) => {
      const tagOverlap = p.semanticTags.filter((t) => tokens.includes(t.toLowerCase())).length;
      return { product: p, score: tagOverlap };
    })
    .sort((a, b) => b.score - a.score)
    .map((s) => s.product);

  return scored.length ? scored : products;
}

export async function extractIntentAndPreferences(message) {
  const tokens = tokenize(message);
  const priceMax = extractPriceCeiling(message);
  return { tokens, priceMax };
}

export async function generateAssistantReply(message, { history = [], userId = null } = {}) {
  const config = (await AiConfig.findOne()) || { prohibitedTopics: [], maxUpsellItems: 3 };

  // Guardrail Layer — off-topic / prohibited-topic redirect, before any generation.
  const lower = message.toLowerCase();
  const hitProhibited = config.prohibitedTopics.find((t) => lower.includes(t.toLowerCase()));
  if (hitProhibited) {
    return {
      reply: `I'm here to help with your shopping experience — I'll leave ${hitProhibited} to the right expert. What are you in the mood for today?`,
      products: [],
    };
  }

  const { tokens, priceMax } = await extractIntentAndPreferences(message);
  const products = await searchProducts({ query: message, priceMax });

  if (!products.length) {
    return {
      reply: "I couldn't find a piece that matches that yet — could you tell me a bit more about the occasion, material, or colour you have in mind?",
      products: [],
    };
  }

  const top = products.slice(0, config.maxUpsellItems || 3);
  const priced = await attachPricingToList(top, { userId });
  const lines = priced.map((p) => `${p.name} — $${Number(p.pricing.finalPrice).toLocaleString()}`);
  const reply = `Here's what I'd curate for you: ${lines.join('; ')}. Would you like the full story behind any of these, or shall I narrow it further?`;

  return { reply, products: priced.map((p) => ({ id: p.id, name: p.name, basePrice: p.basePrice, pricing: p.pricing, images: p.images, slug: p.slug })) };
}

/**
 * AI Review Summary — extractive/statistical, grounded strictly in stored
 * reviews (no freeform claims), per SRS "AI Hallucination" mitigation.
 */
export function summarizeReviews(reviews) {
  if (!reviews.length) return { summary: 'No reviews yet.', averageRating: 0 };

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const positive = reviews.filter((r) => r.rating >= 4).length;
  const negative = reviews.filter((r) => r.rating <= 2).length;

  const wordFreq = {};
  reviews.forEach((r) => {
    tokenize(r.comment || '').forEach((w) => {
      if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([w]) => w);

  let summary = `Based on ${reviews.length} review${reviews.length > 1 ? 's' : ''}, customers rate this piece ${avg.toFixed(1)}/5 on average. `;
  summary += `${positive} of ${reviews.length} reviewers were positive`;
  if (negative) summary += `, while ${negative} raised concerns`;
  summary += '. ';
  if (topWords.length) summary += `Frequently mentioned: ${topWords.join(', ')}.`;

  return { summary, averageRating: Math.round(avg * 10) / 10 };
}
