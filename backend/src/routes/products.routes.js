import { Router } from 'express';
import { Op } from 'sequelize';
import { Product, Review, ProductAiSummary } from '../models/index.js';
import { computeDynamicPrice, attachPricingToList } from '../utils/pricingEngine.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Personalized-ish homepage: curated edit + latest + trending (by real view count), re-ranked by stock/limited-edition signal
router.get('/homepage', optionalAuth, async (req, res) => {
  const [curated, latest, trending] = await Promise.all([
    Product.findAll({ where: { isLimitedEdition: true }, limit: 6 }),
    Product.findAll({ order: [['createdAt', 'DESC']], limit: 8 }),
    Product.findAll({ where: { viewCount: { [Op.gt]: 0 } }, order: [['viewCount', 'DESC']], limit: 4 }),
  ]);
  const userId = req.user?.id;
  res.json({
    curatedEdit: await attachPricingToList(curated, { userId }),
    newArrivals: await attachPricingToList(latest, { userId }),
    trending: await attachPricingToList(trending, { userId }),
  });
});

router.get('/categories', async (_req, res) => {
  const rows = await Product.findAll({ attributes: ['category'], group: ['category'] });
  res.json(rows.map((r) => r.category).filter(Boolean).sort());
});

router.get('/', optionalAuth, async (req, res) => {
  const { category, q, minPrice, maxPrice, sort, inStockOnly } = req.query;
  const where = {};
  if (category) where.category = category;
  if (q) where.name = { [Op.iLike]: `%${q}%` };
  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) where.basePrice[Op.gte] = Number(minPrice);
    if (maxPrice) where.basePrice[Op.lte] = Number(maxPrice);
  }
  if (inStockOnly === 'true') where.stock = { [Op.gt]: 0 };

  const order =
    sort === 'price_asc' ? [['basePrice', 'ASC']] :
    sort === 'price_desc' ? [['basePrice', 'DESC']] :
    sort === 'popular' ? [['viewCount', 'DESC']] :
    [['createdAt', 'DESC']];

  const products = await Product.findAll({ where, order });
  res.json(await attachPricingToList(products, { userId: req.user?.id }));
});

router.get('/:slug', optionalAuth, async (req, res) => {
  const product = await Product.findOne({ where: { slug: req.params.slug } });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Real view-count increment — powers the "Trending" rail, not a decorative number
  await product.increment('viewCount');

  const pricing = await computeDynamicPrice(product, { userId: req.user?.id, persistAudit: true });
  const summary = await ProductAiSummary.findOne({ where: { productId: product.id } });

  res.json({ ...product.toJSON(), viewCount: product.viewCount + 1, pricing, aiSummary: summary?.summary || null, averageRating: summary?.averageRating || 0 });
});

router.get('/:slug/reviews', async (req, res) => {
  const product = await Product.findOne({ where: { slug: req.params.slug } });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const reviews = await Review.findAll({ where: { productId: product.id }, order: [['createdAt', 'DESC']] });
  res.json(reviews);
});

router.post('/:slug/reviews', async (req, res) => {
  const product = await Product.findOne({ where: { slug: req.params.slug } });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { rating, comment, userId } = req.body;
  const review = await Review.create({ productId: product.id, userId: userId || null, rating, comment });

  // Regenerate the grounded AI review summary
  const { summarizeReviews } = await import('../utils/aiOrchestrator.js');
  const allReviews = await Review.findAll({ where: { productId: product.id } });
  const { summary, averageRating } = summarizeReviews(allReviews);
  await ProductAiSummary.upsert({ productId: product.id, summary, averageRating, reviewCountAtGeneration: allReviews.length });

  res.status(201).json(review);
});

export default router;
