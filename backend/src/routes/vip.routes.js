import { Router } from 'express';
import { VipMembership } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const TIER_BENEFITS = {
  silver: ['Early access to new arrivals', 'Birthday gift'],
  gold: ['Early access to new arrivals', 'Complimentary gift wrapping', 'Dedicated stylist chat'],
  platinum: ['All Gold benefits', 'White-glove delivery on every order', 'Private appointment booking', 'Step-up 2FA account protection'],
};

router.get('/benefits', authenticate, async (req, res) => {
  let vip = await VipMembership.findOne({ where: { userId: req.user.id } });
  if (!vip) return res.json({ isMember: false });
  res.json({ isMember: true, tier: vip.tier, benefits: vip.benefits, points: vip.points, since: vip.since });
});

router.post('/join', authenticate, async (req, res) => {
  const existing = await VipMembership.findOne({ where: { userId: req.user.id } });
  if (existing) return res.status(409).json({ error: 'Already a VIP member' });
  const vip = await VipMembership.create({ userId: req.user.id, tier: 'silver', benefits: TIER_BENEFITS.silver });
  res.status(201).json(vip);
});

export default router;
