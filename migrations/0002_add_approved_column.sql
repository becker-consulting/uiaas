-- Gates crowd-submitted facts (POST /fact — routes/api.ts) behind manual
-- review before they're served publicly via GET /fact (see getRandomFact
-- in src/lib/facts.ts, which now filters on this column). New rows default
-- to unapproved — the curated rows that predate this column are backfilled
-- to approved here so they keep appearing without needing re-seeding.
ALTER TABLE facts ADD COLUMN approved BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE facts SET approved = TRUE;
