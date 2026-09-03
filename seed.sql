-- Curated starter facts for local/dev use. Not a migration — run via
-- `npm run db:seed:local` / `npm run db:seed:remote` (see README). Safe to
-- re-run against an empty `facts` table; re-running against a non-empty one
-- will duplicate rows, so clear the table first if that's not what you want.
--
-- `usefulness` is the Negative Usefulness Index(tm) — 0 or lower, enforced
-- by a CHECK constraint (migrations/0001_create_facts_table.sql). See
-- uselessnessLabel() in src/lib/facts.ts for what each range means:
--   0  — perfectly useless, as advertised (already common knowledge)
--  -1  — you will bring this up at a dinner party and regret it
--  -3  — this fact will replace something useful you used to know
--  -5  — legally you cannot un-know this
INSERT INTO facts (fact, usefulness) VALUES
  ('A group of flamingos is called a flamboyance.', -1),
  ('The Eiffel Tower can grow more than 6 inches taller in summer due to thermal expansion of the iron.', -1),
  ('Honey never spoils — edible honey has been found in 3,000-year-old Egyptian tombs.', 0),
  ('Octopuses have three hearts, and two of them stop beating when the octopus swims.', 0),
  ('A single cloud can weigh more than a million pounds.', -3),
  ('Bananas are berries, but strawberries are not.', -3),
  ('The shortest war in recorded history lasted 38 minutes, between Britain and Zanzibar in 1896.', -1),
  ('Wombat droppings are cube-shaped.', -1),
  ('There are more possible iterations of a game of chess than atoms in the observable universe.', -3),
  ('Scotland''s national animal is the unicorn.', -1),
  ('A bolt of lightning is roughly five times hotter than the surface of the sun.', 0),
  ('The dot over a lowercase "i" or "j" has a name: it''s called a tittle.', -1),
  ('Sea otters hold hands while sleeping so they don''t drift apart.', 0),
  ('It rains diamonds on Saturn and Jupiter.', -3),
  ('The inventor of the frisbee was turned into a frisbee after he died — his ashes were molded into memorial discs.', -5);
