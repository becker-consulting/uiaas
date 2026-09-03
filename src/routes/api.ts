import { Hono } from 'hono';
import type { Env } from '../types';
import { getRandomFact, toPublicFactId } from '../lib/facts';

export const api = new Hono<{ Bindings: Env }>();

// GET /api/v1/fact — the entire product. Free, Pro and Enterprise all hit
// this exact same handler (see the landing page's pricing section) —
// `tier_required: "any"` is the whole enforcement story.
api.get('/fact', async (c) => {
  const row = await getRandomFact(c.env.DB);
  if (!row) {
    // Only reachable against an unseeded database — see README "Local development".
    return c.json({ error: 'No facts available. Enterprise support has been notified (it has not).' }, 503);
  }

  // Free tier's "3 pieces of useless information per day" — advertised on
  // the pricing card, reflected here as headers, never actually enforced.
  c.header('X-RateLimit-Limit', '3');
  c.header('X-RateLimit-Remaining', '3');

  return c.json({
    fact: row.fact,
    usefulness: 0,
    id: toPublicFactId(row.id),
    tier_required: 'any',
  });
});
