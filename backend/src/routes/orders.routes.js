import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, Product, VipMembership, LedgerEntry } from '../models/index.js';
import { computeDynamicPrice } from '../utils/pricingEngine.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = Router();

// Frictionless checkout — Section 12/13/14. AI never touches this flow directly
// (it may only have influenced discovery upstream, tracked via `aiAssisted`).
const GIFT_WRAP_FEE = 45;
const WHITE_GLOVE_FEE = 120;

router.post('/checkout', optionalAuth, async (req, res) => {
  try {
    const { items, shippingAddress, giftWrap, whiteGloveDelivery, paymentMethod, aiAssisted } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

    let subtotal = 0;
    const orderItemsData = [];
    for (const line of items) {
      const product = await Product.findByPk(line.productId);
      if (!product) return res.status(404).json({ error: `Product ${line.productId} not found` });
      if (product.stock < line.quantity) return res.status(409).json({ error: `${product.name} is out of stock` });

      const { finalPrice } = await computeDynamicPrice(product, { userId: req.user?.id });
      subtotal += finalPrice * line.quantity;
      const nameSnapshot = line.selectedSize ? `${product.name} (Size: ${line.selectedSize})` : product.name;
      orderItemsData.push({ productId: product.id, nameSnapshot, priceSnapshot: finalPrice, quantity: line.quantity });
    }

    let discount = 0;
    let isVIP = false;
    let vipTier = null;
    if (req.user) {
      const vip = await VipMembership.findOne({ where: { userId: req.user.id } });
      if (vip) {
        isVIP = true;
        vipTier = vip.tier;
        if (vip.tier === 'gold') discount = subtotal * 0.05;
        if (vip.tier === 'platinum') discount = subtotal * 0.1;
      }
    }

    // Gift wrapping is complimentary for Gold+ VIP; white-glove delivery is complimentary for Platinum (Section 24 benefits).
    let fees = 0;
    if (giftWrap && !['gold', 'platinum'].includes(vipTier)) fees += GIFT_WRAP_FEE;
    if (whiteGloveDelivery && vipTier !== 'platinum') fees += WHITE_GLOVE_FEE;

    const total = Math.round((subtotal - discount + fees) * 100) / 100;
    const order = await Order.create({
      orderNumber: `LX-${Date.now().toString(36).toUpperCase()}`,
      userId: req.user?.id || null,
      channel: 'online',
      isVIP,
      aiAssisted: !!aiAssisted,
      status: 'paid', // demo payment gateway — always succeeds
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total,
      shippingAddress: shippingAddress || {},
      giftWrap: !!giftWrap,
      whiteGloveDelivery: !!whiteGloveDelivery,
      paymentMethod: paymentMethod || 'card',
    });

    for (const item of orderItemsData) {
      await OrderItem.create({ ...item, orderId: order.id });
      const product = await Product.findByPk(item.productId);
      await product.update({ stock: Math.max(0, product.stock - item.quantity) });
    }

    await LedgerEntry.create({ type: 'sale', amount: total, channel: 'online', referenceId: order.id });

    res.status(201).json({ order, items: orderItemsData });
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed', detail: err.message });
  }
});

router.get('/mine', authenticate, async (req, res) => {
  const orders = await Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem, as: 'items' }], order: [['createdAt', 'DESC']] });
  res.json(orders);
});

router.get('/:id', authenticate, async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }] });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

export default router;
