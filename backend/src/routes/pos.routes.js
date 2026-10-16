import { Router } from 'express';
import { Op } from 'sequelize';
import {
  PosTerminal, PosTransaction, CashDrawerSession, LedgerEntry,
  Product, Order, OrderItem, VipMembership, UserStyleProfile, User,
} from '../models/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireRole('pos_staff', 'super_admin'));

router.get('/terminals', async (_req, res) => {
  res.json(await PosTerminal.findAll());
});

// Clienteling lookup — style profile + VIP tier only, never full order/payment history (Section 47 privacy scope)
router.get('/clienteling/:userId', async (req, res) => {
  const [profile, vip, user] = await Promise.all([
    UserStyleProfile.findOne({ where: { userId: req.params.userId } }),
    VipMembership.findOne({ where: { userId: req.params.userId } }),
    User.findByPk(req.params.userId, { attributes: ['id', 'name', 'email'] }),
  ]);
  if (!user) return res.status(404).json({ error: 'Customer not found' });
  res.json({
    customer: user,
    stylePreferences: profile?.preferences || {},
    learnedTags: profile?.learnedTags || [],
    vipTier: vip?.tier || null,
  });
});

router.post('/cash-drawer/open', async (req, res) => {
  const { terminalId, openingCash } = req.body;
  const session = await CashDrawerSession.create({ terminalId, openedBy: req.user.id, openingCash, status: 'open' });
  res.status(201).json(session);
});

router.post('/cash-drawer/:id/close', async (req, res) => {
  const session = await CashDrawerSession.findByPk(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const { closingCash } = req.body;
  const variance = Math.round((closingCash - session.openingCash) * 100) / 100;
  await session.update({ closingCash, variance, status: 'closed', closedAt: new Date() });
  res.json(session);
});

// Boutique sale — real-time inventory sync (Section 44) + unified ledger (Section 45)
router.post('/sale', async (req, res) => {
  try {
    const { terminalId, userId, items, paymentMethod } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items in sale' });

    let total = 0;
    const orderItemsData = [];
    for (const line of items) {
      const product = await Product.findByPk(line.productId);
      if (!product) return res.status(404).json({ error: `Product ${line.productId} not found` });
      if (product.stock < line.quantity) return res.status(409).json({ error: `${product.name} is out of stock` });
      total += Number(product.basePrice) * line.quantity;
      orderItemsData.push({ productId: product.id, nameSnapshot: product.name, priceSnapshot: product.basePrice, quantity: line.quantity });
      await product.update({ stock: product.stock - line.quantity }); // instant online stock sync
    }

    let isVIP = false;
    if (userId) {
      const vip = await VipMembership.findOne({ where: { userId } });
      isVIP = !!vip;
    }

    const order = await Order.create({
      orderNumber: `BQ-${Date.now().toString(36).toUpperCase()}`,
      userId: userId || null,
      channel: 'boutique',
      isVIP,
      status: 'paid',
      subtotal: total,
      total,
      paymentMethod,
    });
    for (const item of orderItemsData) await OrderItem.create({ ...item, orderId: order.id });

    const transaction = await PosTransaction.create({ terminalId, orderId: order.id, userId: userId || null, items: orderItemsData, total, paymentMethod });
    await LedgerEntry.create({ type: 'sale', amount: total, channel: 'boutique', referenceId: order.id });

    res.status(201).json({ transaction, order });
  } catch (err) {
    res.status(500).json({ error: 'Boutique sale failed', detail: err.message });
  }
});

// Accounting / Hisab-Nikash — Section 45
router.get('/reports/daily', async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entries = await LedgerEntry.findAll({ where: { createdAt: { [Op.gte]: today } } });
  const boutique = entries.filter((e) => e.channel === 'boutique').reduce((s, e) => s + Number(e.amount), 0);
  const online = entries.filter((e) => e.channel === 'online').reduce((s, e) => s + Number(e.amount), 0);
  res.json({ boutiqueSales: boutique, onlineSales: online, total: boutique + online, entriesCount: entries.length });
});

export default router;
