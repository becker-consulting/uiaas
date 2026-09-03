-- Schema only. Seed data lives in seed.sql (run separately — see README),
-- not in a migration, so re-seeding/curating facts doesn't mean writing a
-- new migration every time.
--
-- `usefulness` is our proprietary Negative Usefulness Index(tm) — the only
-- metric in tech that goes down when the product improves. Zero is the
-- best score a fact can get (perfectly useless, as advertised); the
-- CHECK constraint makes it structurally impossible to accidentally ship
-- a fact that's actually useful. See uselessnessLabel() in src/lib/facts.ts
-- for what each range means.
CREATE TABLE facts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fact TEXT NOT NULL,
  usefulness INTEGER NOT NULL DEFAULT 0 CHECK (usefulness <= 0)
);
