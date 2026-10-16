import { Router } from 'express';
import { NewsletterSubscriber } from '../models/index.js';

const router = Router();

router.post('/subscribe', async (req, res) => {
  const { email, source } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const [sub, created] = await NewsletterSubscriber.findOrCreate({
      where: { email },
      defaults: { source: source || 'footer' },
    });
    res.status(created ? 201 : 200).json({ subscribed: true, alreadySubscribed: !created });
  } catch (err) {
    res.status(400).json({ error: 'Could not subscribe', detail: err.message });
  }
});

export default router;
