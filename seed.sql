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
--
-- `approved` is set explicitly to TRUE here — these are curated, not
-- crowd-submitted (see migrations/0002_add_approved_column.sql), so unlike
-- a POST /fact submission they should be visible via GET /fact immediately
-- rather than needing manual review. The column defaults to FALSE, so
-- leaving it unset here would silently make every seeded fact invisible.
INSERT INTO facts (fact, usefulness, approved) VALUES
  ('A group of flamingos is called a flamboyance.', -1, TRUE),
  ('The Eiffel Tower can grow more than 6 inches taller in summer due to thermal expansion of the iron.', -1, TRUE),
  ('Honey never spoils — edible honey has been found in 3,000-year-old Egyptian tombs.', 0, TRUE),
  ('Octopuses have three hearts, and two of them stop beating when the octopus swims.', 0, TRUE),
  ('A single cloud can weigh more than a million pounds.', -3, TRUE),
  ('Bananas are berries, but strawberries are not.', -3, TRUE),
  ('The shortest war in recorded history lasted 38 minutes, between Britain and Zanzibar in 1896.', -1, TRUE),
  ('Wombat droppings are cube-shaped.', -1, TRUE),
  ('There are more possible iterations of a game of chess than atoms in the observable universe.', -3, TRUE),
  ('Scotland''s national animal is the unicorn.', -1, TRUE),
  ('A bolt of lightning is roughly five times hotter than the surface of the sun.', 0, TRUE),
  ('The dot over a lowercase "i" or "j" has a name: it''s called a tittle.', -1, TRUE),
  ('Sea otters hold hands while sleeping so they don''t drift apart.', 0, TRUE),
  ('It rains diamonds on Saturn and Jupiter.', -3, TRUE),
  ('The inventor of the frisbee was turned into a frisbee after he died — his ashes were molded into memorial discs.', -5, TRUE),
  ('A shrimp''s heart is located in its head.', -1, TRUE),
  ('Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.', -3, TRUE),
  ('The Great Wall of China is not actually visible from space with the naked eye, despite the popular myth.', -1, TRUE),
  ('A jellyfish species, Turritopsis dohrnii, is biologically immortal — it can revert its cells to an earlier stage of life instead of dying.', -3, TRUE),
  ('The Hawaiian pizza was invented in Canada, not Hawaii.', -1, TRUE),
  ('A day on Venus is longer than a year on Venus.', -3, TRUE),
  ('The inventor of the Pringles can, Fredric Baur, had some of his ashes buried in one.', -5, TRUE),
  ('Oxford University is older than the Aztec Empire.', -3, TRUE),
  ('Under certain conditions, hot water can freeze faster than cold water — a real, still not fully explained phenomenon called the Mpemba effect.', -3, TRUE),
  ('A group of crows is called a murder.', -1, TRUE),
  ('Bubble wrap was originally invented as a textured wallpaper.', -1, TRUE),
  ('Rats are physically incapable of vomiting.', -1, TRUE),
  ('The world''s oldest known written recipe is for beer.', -1, TRUE),
  ('A "jiffy" is an actual unit of time — in physics, it''s defined as the time it takes light to travel one femtometre.', -1, TRUE),
  ('The world''s oceans contain enough gold to give every person on Earth about 4 pounds of it.', -3, TRUE);
