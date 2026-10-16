import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AiConversation, UserStyleProfile } from '../models/index.js';
import { generateAssistantReply, extractIntentAndPreferences } from '../utils/aiOrchestrator.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/chat', optionalAuth, async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  const sid = sessionId || uuidv4();
  let conversation = await AiConversation.findOne({ where: { sessionId: sid } });
  if (!conversation) {
    conversation = await AiConversation.create({ sessionId: sid, userId: req.user?.id || null, messages: [] });
  }

  const { reply, products } = await generateAssistantReply(message, { history: conversation.messages, userId: req.user?.id });

  const messages = [
    ...conversation.messages,
    { role: 'user', content: message, createdAt: new Date().toISOString() },
    { role: 'assistant', content: reply, products: products.map((p) => p.id), createdAt: new Date().toISOString() },
  ];
  await conversation.update({ messages });

  // Style Profile learning — the assistant quietly folds conversation
  // signal into the customer's editable Style Profile (SRS section 17).
  if (req.user) {
    const { tokens } = await extractIntentAndPreferences(message);
    if (tokens.length) {
      const [profile] = await UserStyleProfile.findOrCreate({ where: { userId: req.user.id } });
      const merged = Array.from(new Set([...(profile.learnedTags || []), ...tokens])).slice(-25);
      await profile.update({ learnedTags: merged });
    }
  }

  res.json({ sessionId: sid, reply, products });
});

router.get('/conversations/:id', optionalAuth, async (req, res) => {
  const conversation = await AiConversation.findOne({ where: { sessionId: req.params.id } });
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  res.json(conversation);
});

router.delete('/conversations/:id', optionalAuth, async (req, res) => {
  const conversation = await AiConversation.findOne({ where: { sessionId: req.params.id } });
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  await conversation.destroy();
  res.json({ deleted: true });
});

export default router;
