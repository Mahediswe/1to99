import { Router } from 'express';
import { searchProducts } from '../utils/aiOrchestrator.js';
import { attachPricingToList } from '../utils/pricingEngine.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Semantic/Natural-Language search (Postgres tag-overlap + full text as the
// "semantic-lite" substitute for a vector DB — see SRS section 32.2/33 for
// the intended Vector DB architecture this can be swapped in for).
router.post('/semantic', optionalAuth, async (req, res) => {
  const { query, priceMax, category } = req.body;
  const products = await searchProducts({ query, priceMax, category });
  res.json(await attachPricingToList(products, { userId: req.user?.id }));
});

// Voice search — real browser speech-to-text on the frontend (Web Speech API)
// posts the transcript here, which runs through the same grounded search.
router.post('/voice', optionalAuth, async (req, res) => {
  const { transcript } = req.body;
  const products = await searchProducts({ query: transcript || '' });
  res.json({ transcript: transcript || '', products: await attachPricingToList(products, { userId: req.user?.id }) });
});

// Image search — full computer-vision matching is a Phase 5 roadmap item (SRS
// section 27/29). As an honest, working approximation today, this accepts a
// short description of what's in the photo (color/material/style keywords)
// and runs it through the same grounded catalog search, rather than a dead end.
router.post('/image', optionalAuth, async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Describe what\'s in the photo (e.g. "black leather tote with gold hardware") — full image recognition is on the Phase 5 roadmap.' });
  }
  const products = await searchProducts({ query: description });
  res.json({ interpreted: description, products: await attachPricingToList(products, { userId: req.user?.id }), note: 'Approximated from your description — full visual recognition is a Phase 5 roadmap feature.' });
});

export default router;
