import { Hono } from 'hono';
import type { Env } from '../types';
import { getRandomFact, MAX_FACT_LENGTH, submitFact, toPublicFactId, uselessnessLabel } from '../lib/facts';
import { openApiSpec } from '../lib/openapi';

export const api = new Hono<{ Bindings: Env }>();

// GET /api/v1/openapi.json — backs the Swagger UI served at /docs
// (src/index.tsx), which is what the nav's "API" link points to.
api.get('/openapi.json', (c) => c.json(openApiSpec));

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
    usefulness: row.usefulness,
    uselessness_label: uselessnessLabel(row.usefulness),
    id: toPublicFactId(row.id),
    tier_required: 'any',
  });
});

// POST /api/v1/fact — open to anyone, no auth, by design (matches "any
// tier" above). Two independent layers, not one doing double duty: the
// moderation gate (a submission is never immediately live — GET /fact
// won't return it until approved, see getRandomFact/submitFact in
// lib/facts.ts) stops a flood from ever reaching a reader; the rate limit
// below stops a flood from being written at all. Real, not the free
// tier's advertised-but-unenforced joke above — SUBMIT_RATE_LIMITER is a
// native Workers rate limit binding (wrangler.jsonc), keyed on the
// client's IP.
api.post('/fact', async (c) => {
  // CF-Connecting-IP is set by Cloudflare's edge itself (unlike
  // X-Forwarded-For, which a client could set before reaching it) — absent
  // in local dev, where every request shares one bucket instead.
  const clientIp = c.req.header('CF-Connecting-IP') ?? 'local-dev';
  const { success } = await c.env.SUBMIT_RATE_LIMITER.limit({ key: clientIp });
  if (!success) {
    // The binding doesn't report a reset time; 60 is the configured
    // window (wrangler.jsonc), not an exact countdown.
    c.header('Retry-After', '60');
    return c.json({ error: 'Too many submissions in a short window. Enterprise-grade patience has limits.' }, 429);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const fact = body !== null && typeof body === 'object' && 'fact' in body ? (body as { fact: unknown }).fact : undefined;
  if (typeof fact !== 'string' || fact.trim().length === 0) {
    return c.json({ error: 'A non-empty "fact" string is required.' }, 400);
  }
  const trimmed = fact.trim();
  if (trimmed.length > MAX_FACT_LENGTH) {
    return c.json({ error: `"fact" must be ${MAX_FACT_LENGTH} characters or fewer.` }, 400);
  }

  const id = await submitFact(c.env.DB, trimmed);

  return c.json(
    {
      id: toPublicFactId(id),
      status: 'pending_review',
      message: "Submission received and entered into editorial review. Published submissions are selected at UIaaS's sole discretion.",
    },
    201,
  );
});
