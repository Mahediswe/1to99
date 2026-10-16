import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import {
  Product, PricingRule, PriceAuditLog, VipMembership, Order, OrderItem,
  AiConfig, AiConversation, User,
} from '../models/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const ADMIN_ROLES = ['content_admin', 'pricing_admin', 'ai_ops_admin', 'super_admin'];

// --- Analytics Overview ---
router.get('/dashboard', requireRole(...ADMIN_ROLES), async (_req, res) => {
  const [totalSales, aiAssistedOrders, vipMembers, activeRules, orders] = await Promise.all([
    Order.sum('total', { where: { status: 'paid' } }),
    Order.count({ where: { aiAssisted: true } }),
    VipMembership.count(),
    PricingRule.count({ where: { active: true } }),
    Order.findAll({ order: [['createdAt', 'DESC']], limit: 10, include: [{ model: OrderItem, as: 'items' }] }),
  ]);
  res.json({
    totalSales: totalSales || 0,
    aiAssistedOrders,
    vipMembers,
    activePriceRules: activeRules,
    recentOrders: orders,
  });
});

// Sales Trend (last 14 days) + Category Distribution — SRS section 40 wireframe charts
router.get('/dashboard/charts', requireRole(...ADMIN_ROLES), async (_req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const recentOrders = await Order.findAll({ where: { status: 'paid', createdAt: { [Op.gte]: since } } });
  const byDay = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }
  recentOrders.forEach((o) => {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (byDay[key] !== undefined) byDay[key] += Number(o.total);
  });
  const salesTrend = Object.entries(byDay).map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }));

  const products = await Product.findAll({ attributes: ['category'] });
  const categoryCounts = {};
  products.forEach((p) => { categoryCounts[p.category || 'Uncategorized'] = (categoryCounts[p.category || 'Uncategorized'] || 0) + 1; });
  const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));

  res.json({ salesTrend, categoryDistribution });
});

// --- Products (Content/Brand Admin) ---
router.get('/products', requireRole(...ADMIN_ROLES), async (_req, res) => {
  res.json(await Product.findAll({ order: [['createdAt', 'DESC']] }));
});

router.post('/products', requireRole('content_admin', 'super_admin'), async (req, res) => {
  try {
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uuidv4().slice(0, 6);
    const product = await Product.create({ ...req.body, slug });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Could not create product', detail: err.message });
  }
});

router.put('/products/:id', requireRole('content_admin', 'super_admin'), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  await product.update(req.body);
  res.json(product);
});

router.delete('/products/:id', requireRole('content_admin', 'super_admin'), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  await product.destroy();
  res.json({ deleted: true });
});

// --- Dynamic Pricing Rule Engine (Pricing Admin) ---
router.get('/pricing-rules', requireRole('pricing_admin', 'super_admin'), async (_req, res) => {
  res.json(await PricingRule.findAll({ order: [['createdAt', 'DESC']] }));
});

router.post('/pricing-rules', requireRole('pricing_admin', 'super_admin'), async (req, res) => {
  const rule = await PricingRule.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json(rule);
});

router.put('/pricing-rules/:id', requireRole('pricing_admin', 'super_admin'), async (req, res) => {
  const rule = await PricingRule.findByPk(req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  await rule.update(req.body);
  res.json(rule);
});

router.delete('/pricing-rules/:id', requireRole('pricing_admin', 'super_admin'), async (req, res) => {
  const rule = await PricingRule.findByPk(req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  await rule.destroy();
  res.json({ deleted: true });
});

router.get('/pricing-audit-log', requireRole('pricing_admin', 'super_admin'), async (_req, res) => {
  res.json(await PriceAuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 100 }));
});

// --- VIP Membership Management ---
router.get('/vip-members', requireRole(...ADMIN_ROLES), async (_req, res) => {
  const members = await VipMembership.findAll({ include: [{ model: User, attributes: ['id', 'name', 'email'] }] });
  res.json(members);
});

router.put('/vip-members/:id', requireRole('super_admin'), async (req, res) => {
  const vip = await VipMembership.findByPk(req.params.id);
  if (!vip) return res.status(404).json({ error: 'Membership not found' });
  await vip.update(req.body);
  res.json(vip);
});

// --- Orders ---
router.get('/orders', requireRole(...ADMIN_ROLES), async (_req, res) => {
  res.json(await Order.findAll({ order: [['createdAt', 'DESC']], include: [{ model: OrderItem, as: 'items' }] }));
});

// --- AI Assistant Configuration (AI Ops Admin) ---
router.get('/ai-config', requireRole('ai_ops_admin', 'super_admin'), async (_req, res) => {
  let config = await AiConfig.findOne();
  if (!config) config = await AiConfig.create({});
  res.json(config);
});

router.put('/ai-config', requireRole('ai_ops_admin', 'super_admin'), async (req, res) => {
  let config = await AiConfig.findOne();
  if (!config) config = await AiConfig.create({});
  await config.update(req.body);
  res.json(config);
});

router.get('/ai-performance', requireRole('ai_ops_admin', 'super_admin'), async (_req, res) => {
  const conversations = await AiConversation.count();
  const aiAssistedOrders = await Order.count({ where: { aiAssisted: true } });
  const totalOrders = await Order.count();
  res.json({
    totalConversations: conversations,
    aiAssistedOrders,
    aiConversionRate: totalOrders ? Math.round((aiAssistedOrders / totalOrders) * 1000) / 10 : 0,
  });
});

// --- Market Intelligence: platform performance benchmarked against cited industry
// research (SRS section 2 — Morgan Stanley, McKinsey, eMarketer, ChatGPT Shopping data).
// Figures are attributed to their source and dated; this is not live third-party data.
router.get('/market-intelligence', requireRole(...ADMIN_ROLES), async (_req, res) => {
  const [totalOrders, aiAssistedOrders, vipMembers, totalUsers, products] = await Promise.all([
    Order.count(),
    Order.count({ where: { aiAssisted: true } }),
    VipMembership.count(),
    User.count({ where: { role: 'customer' } }),
    Product.count(),
  ]);

  const aiConversionRate = totalOrders ? Math.round((aiAssistedOrders / totalOrders) * 1000) / 10 : 0;
  const vipPenetration = totalUsers ? Math.round((vipMembers / totalUsers) * 1000) / 10 : 0;

  res.json({
    platform: {
      aiConversionRate,
      vipPenetration,
      totalOrders,
      totalProducts: products,
    },
    industryBenchmarks: [
      {
        metric: 'AI shopping agent adoption by 2030',
        value: '~50% of online consumers',
        source: 'Morgan Stanley forecast',
        note: 'Projected to represent roughly 25% of total online spend by 2030.',
      },
      {
        metric: 'Agentic commerce TAM by 2030 (US B2C retail)',
        value: '$1T (up to $3–5T bull case)',
        source: 'McKinsey',
      },
      {
        metric: 'ChatGPT-referred shopper conversion rate',
        value: '2.47%',
        source: 'Industry analysis, 2026',
        note: 'Roughly 5x higher than average paid-search or social referral conversion.',
      },
      {
        metric: 'Online searches now touched by AI-assisted discovery',
        value: '40%+',
        source: 'eMarketer',
      },
      {
        metric: 'Luxury price-segment growth vs. category average',
        value: 'Fastest-growing luxury segment',
        source: 'Industry analysis, 2026',
        note: 'High-net-worth shoppers increasingly favor curated, vetted channels over open marketplaces.',
      },
    ],
    competitiveLandscape: [
      { name: 'Farfetch-type luxury marketplaces', strength: 'Curated brand network, price stability', gap: 'Limited personalization depth' },
      { name: 'ChatGPT / Gemini native shopping', strength: 'Agentic, conversational, high conversion', gap: 'No dedicated storefront or brand storytelling' },
      { name: 'Legacy luxury e-commerce', strength: 'Brand heritage, editorial content', gap: 'Static pricing, no AI-driven upsell/reranking' },
    ],
    generatedAt: new Date().toISOString(),
  });
});

export default router;
