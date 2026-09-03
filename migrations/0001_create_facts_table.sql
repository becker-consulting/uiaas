-- Schema only. Seed data lives in seed.sql (run separately — see README),
-- not in a migration, so re-seeding/curating facts doesn't mean writing a
-- new migration every time.
CREATE TABLE facts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fact TEXT NOT NULL,
  usefulness INTEGER NOT NULL DEFAULT 0
);
