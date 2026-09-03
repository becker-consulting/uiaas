export type FactRow = {
  id: number;
  fact: string;
  usefulness: number;
};

/**
 * One random *approved* row from `facts`, or `null` if there isn't one yet
 * (e.g. a fresh database before `npm run db:seed:local`/`db:seed:remote`
 * has been run). A crowd-submitted fact (see `submitFact` below) is
 * unapproved by default and won't be returned here until it's reviewed —
 * there's no admin UI for that yet, just direct DB access.
 *
 * Used to be `ORDER BY RANDOM() LIMIT 1` — a full-table scan, since SQLite
 * has to compute and sort a random key for every matching row before
 * picking the top one. Now reads the edge-cached approved-facts list
 * (`getApprovedFactsCached`, below) and picks randomly in Worker code
 * instead: on a cache hit (the common case, within the 5-minute TTL) this
 * costs zero D1 reads at all, and even on a cache miss it's one unsorted
 * scan rather than a sorted one. The tradeoff is the same staleness the
 * count badge already accepts — a fact approved or unapproved in the last
 * 5 minutes might not be reflected yet — which is fine for a
 * curated/occasionally-updated list.
 */
export async function getRandomFact(db: D1Database): Promise<FactRow | null> {
  const facts = await getApprovedFactsCached(db);
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

/** Longest `fact` string POST /fact will accept — see routes/api.ts. */
export const MAX_FACT_LENGTH = 500;

/**
 * Inserts a crowd-submitted fact and returns its row id. Always lands
 * unapproved (the `approved` column's own default — see
 * migrations/0002_add_approved_column.sql) and at the default `usefulness`
 * score (0): scoring a fact on the Negative Usefulness Index™ is an
 * editorial judgment call (see uselessnessLabel's doc comment), not
 * something a submitter sets for themselves.
 */
export async function submitFact(db: D1Database, fact: string): Promise<number> {
  const result = await db.prepare('INSERT INTO facts (fact) VALUES (?)').bind(fact).run();
  return result.meta.last_row_id;
}

/** Total number of approved facts — the number GET /fact actually draws from. */
export async function getApprovedFactCount(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) as count FROM facts WHERE approved = TRUE').first<{ count: number }>();
  return row?.count ?? 0;
}

// Shared TTL for both edge caches below (the count and the full approved-facts
// list) — same staleness tradeoff, so one constant rather than two identical
// ones.
const APPROVED_FACTS_CACHE_TTL_SECONDS = 300;

const FACT_COUNT_CACHE_KEY = new Request('https://internal.uiaas/cache/approved-fact-count');

/**
 * `getApprovedFactCount`, cached at Cloudflare's edge via the Workers Cache
 * API — no extra binding needed, `caches.default` is a runtime global —
 * so the landing page's "N facts in production" badge doesn't run a fresh
 * `COUNT(*)` on every single page view. The cache key is a synthetic
 * internal URL, not a real route; nothing external ever requests it.
 * Simplicity over squeezing out the last bit of latency: the cache-miss
 * path awaits the write-back inline rather than using `waitUntil` to
 * return early, since that only costs the (rare, once per TTL window)
 * request that repopulates the cache.
 */
export async function getApprovedFactCountCached(db: D1Database): Promise<number> {
  const cache = caches.default;
  const cached = await cache.match(FACT_COUNT_CACHE_KEY);
  if (cached) {
    const { count } = await cached.json<{ count: number }>();
    return count;
  }

  const count = await getApprovedFactCount(db);
  await cache.put(
    FACT_COUNT_CACHE_KEY,
    new Response(JSON.stringify({ count }), {
      headers: { 'Cache-Control': `max-age=${APPROVED_FACTS_CACHE_TTL_SECONDS}`, 'Content-Type': 'application/json' },
    }),
  );
  return count;
}

const APPROVED_FACTS_CACHE_KEY = new Request('https://internal.uiaas/cache/approved-facts');

/**
 * Every approved row from `facts`, cached at Cloudflare's edge via the same
 * `caches.default` pattern as `getApprovedFactCountCached` above (same TTL,
 * same synthetic internal cache key style, same inline-await-on-miss
 * tradeoff — no extra binding needed for either). `getRandomFact` reads
 * this cached list and picks a random entry in Worker code rather than
 * asking D1 to do it — see `getRandomFact`'s own doc comment for why.
 * Exported (not just used internally) so it's independently testable the
 * same way the count cache is, per this project's "verify the caching
 * genuinely works" convention.
 */
export async function getApprovedFactsCached(db: D1Database): Promise<FactRow[]> {
  const cache = caches.default;
  const cached = await cache.match(APPROVED_FACTS_CACHE_KEY);
  if (cached) {
    return cached.json<FactRow[]>();
  }

  const { results } = await db.prepare('SELECT id, fact, usefulness FROM facts WHERE approved = TRUE').all<FactRow>();
  await cache.put(
    APPROVED_FACTS_CACHE_KEY,
    new Response(JSON.stringify(results), {
      headers: { 'Cache-Control': `max-age=${APPROVED_FACTS_CACHE_TTL_SECONDS}`, 'Content-Type': 'application/json' },
    }),
  );
  return results;
}

/** Formats a fact's row id as the public-facing `uiaas_00042`-style id. */
export function toPublicFactId(id: number): string {
  return `uiaas_${String(id).padStart(5, '0')}`;
}

/**
 * Human-readable rating for a fact's Negative Usefulness Index(tm) score.
 * Bucketed by threshold, not exact match, so any value the CHECK constraint
 * allows (`usefulness <= 0`) gets a sensible label, not just the four
 * canonical scores (0, -1, -3, -5) used in seed.sql.
 */
export function uselessnessLabel(usefulness: number): string {
  if (usefulness <= -5) return 'Legally you cannot un-know this.';
  if (usefulness <= -3) return 'This fact will replace something useful you used to know.';
  if (usefulness <= -1) return 'You will bring this up at a dinner party and regret it.';
  return 'Perfectly useless, as advertised.';
}
