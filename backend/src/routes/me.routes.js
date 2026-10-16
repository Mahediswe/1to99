import { Router } from 'express';
import { WishlistItem, Product, UserStyleProfile, AiConversation } from '../models/index.js';
import { attachPricingToList } from '../utils/pricingEngine.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// --- Wishlist (Customer Dashboard) ---
router.get('/wishlist', async (req, res) => {
  const items = await WishlistItem.findAll({ where: { userId: req.user.id } });
  const products = await Product.findAll({ where: { id: items.map((i) => i.productId) } });
  res.json(await attachPricingToList(products, { userId: req.user.id }));
});

router.post('/wishlist/:productId', async (req, res) => {
  const [item] = await WishlistItem.findOrCreate({ where: { userId: req.user.id, productId: req.params.productId } });
  res.status(201).json(item);
});

router.delete('/wishlist/:productId', async (req, res) => {
  await WishlistItem.destroy({ where: { userId: req.user.id, productId: req.params.productId } });
  res.json({ removed: true });
});

// --- Style Profile — "AI just learned this about you, editable" (Section 17) ---
router.get('/style-profile', async (req, res) => {
  let profile = await UserStyleProfile.findOne({ where: { userId: req.user.id } });
  if (!profile) profile = await UserStyleProfile.create({ userId: req.user.id });
  res.json(profile);
});

router.put('/style-profile', async (req, res) => {
  let profile = await UserStyleProfile.findOne({ where: { userId: req.user.id } });
  if (!profile) profile = await UserStyleProfile.create({ userId: req.user.id });
  const { preferences, learnedTags } = req.body;
  await profile.update({
    preferences: preferences ?? profile.preferences,
    learnedTags: learnedTags ?? profile.learnedTags,
  });
  res.json(profile);
});

// --- My AI Shopping History (Section 17) ---
router.get('/ai-history', async (req, res) => {
  const conversations = await AiConversation.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 20,
  });
  res.json(conversations);
});

router.delete('/ai-history/:sessionId', async (req, res) => {
  const convo = await AiConversation.findOne({ where: { userId: req.user.id, sessionId: req.params.sessionId } });
  if (!convo) return res.status(404).json({ error: 'Conversation not found' });
  await convo.destroy();
  res.json({ deleted: true });
});

export default router;
