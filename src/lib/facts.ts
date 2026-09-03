export type FactRow = {
  id: number;
  fact: string;
  usefulness: number;
};

/**
 * One random row from `facts`, or `null` if the table is empty (e.g. a fresh
 * database before `npm run db:seed:local`/`db:seed:remote` has been run).
 *
 * `ORDER BY RANDOM()` is a full-table scan — fine at this table's expected
 * size (a curated/occasionally-fetched fact list, not user-generated data),
 * not something to reach for on a large table.
 */
export async function getRandomFact(db: D1Database): Promise<FactRow | null> {
  const row = await db.prepare('SELECT id, fact, usefulness FROM facts ORDER BY RANDOM() LIMIT 1').first<FactRow>();
  return row ?? null;
}

/** Formats a fact's row id as the public-facing `uiaas_00042`-style id. */
export function toPublicFactId(id: number): string {
  return `uiaas_${String(id).padStart(5, '0')}`;
}
