# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`uiaas` — a parody SaaS ("Useless Information as a Service") deployed as a
single Cloudflare Worker: a Hono app serving both a server-rendered landing
page and a versioned JSON API (`GET /api/v1/fact`) backed by D1. See
[uiaas-brief.md](uiaas-brief.md) for the concept and the confirmed copy (hero
headline, tagline, etc.) — treat that copy as fixed; treat everything else in
the brief as a starting sketch. The tone throughout is **deadpan**: the app
takes itself exactly as seriously as a real SaaS would. No wink emoji, no
"lol jk" anywhere in copy or comments that face the reader.

## Look and feel

Dark, self-serious enterprise SaaS — a deliberate single look, not a
light/dark toggle (`src/pages/styles.ts`'s `:root` sets `color-scheme: dark`
unconditionally; there's no light-mode block to keep in sync). Deep-black
background with a subtle grid texture, a violet brand glow behind the hero,
`Space Grotesk` for display type + `Inter` for body (loaded from Google
Fonts in `Landing.tsx`'s `<head>` — a real font CDN load for a real deployed
site, not the Artifact-tool CDN allowlist some other Claude Code contexts
apply, which doesn't govern this repo at all), gold for the "Sponsor an
Endpoint" CTA specifically so it reads as the odd one out against the
violet primary buttons. Status-page furniture ("● ALL SYSTEMS OPERATIONAL" above the hero)
and monospace `$`-figure pricing lean into "taking itself too seriously" —
extend that vocabulary for new sections rather than introducing a different
one.

**`UIaaS` set in one weight visually collapses to "UlaaS"** — both loaded
fonts render a plain sans-serif capital I indistinguishably from a lowercase
l next to "aaS", so the brand name reads wrong at a glance. Fixed with the
`Brand` component (`<Brand />`, `Landing.tsx`): `.brand-ui`'s color+weight on
"UI" alone breaks up the run everywhere the name appears — the nav wordmark
included, not a separate treatment there. (An earlier pass gave the nav its
own boxed `.logo-mark` badge instead; dropped for looking inconsistent next
to the plain-text treatment used everywhere else — one visual system reads
better than two independent fixes.) Use `<Brand />` for any new visible
"UIaaS" occurrence instead of typing the plain string — a `<title>`/`<meta>`
value is the one exception, since those never render as on-page glyphs and
don't hit this at all.

## SEO / social preview

This project is meant to be shown off (CV, LinkedIn), so `Landing.tsx`'s
`<head>` carries real Open Graph + Twitter Card tags, a canonical link, and
a minimal `WebSite` JSON-LD block — not just a `<title>`/`<meta
name="description">` and calling it done.

- **`SITE_URL` in `src/config.ts`** is the one place the production origin
  is written down — every absolute-URL tag (canonical, `og:url`,
  `og:image`, `twitter:image`) reads from it. Matters because those tags
  need to be absolute (a social crawler fetches `og:image` as its own HTTP
  request — a relative URL doesn't resolve for it) and this Worker answers
  at both the `uiaas.becker-consulting.se` custom domain and its
  `*.workers.dev` URL — `SITE_URL` is the one `wrangler.jsonc`'s `routes`
  declares canonical, so it's the one used here too. Update both together
  if the domain ever changes.
- **`GET /og-image.svg`** (`src/index.tsx`, built in `src/pages/ogImage.ts`)
  is what `og:image`/`twitter:image` actually point at — a 1200×630 card in
  the site's own dark/violet-glow look, not a generic placeholder. Hand-
  written SVG, not a screenshot or a PNG pipeline: system sans-serif rather
  than the site's own Space Grotesk/Inter, since a social crawler
  rasterizes it without fetching Google Fonts, so designing for the
  fallback directly beats assuming a web font renders. Served with
  `Cache-Control: public, max-age=3600` since it's static output, same
  bytes every request. SVG (not PNG) is a deliberate tradeoff, not an
  oversight: current LinkedIn/Slack/Discord render it fine; X/Twitter's
  crawler has historically been pickier about non-raster preview images —
  if a Twitter Card ever needs pixel-perfect fidelity, rasterizing this
  (e.g. via `resvg-wasm`) is the next step, not a rewrite.
- Keep `PAGE_TITLE`/`PAGE_DESCRIPTION` (top of `Landing.tsx`) as the single
  source both the plain `<meta name="description">` and every OG/Twitter
  variant reuse — don't let the social-preview copy drift from the page's
  own.

## Commands

See "Commands" and "Setup" in [README.md](README.md) for the full list.
`npm run typecheck` and `npm test` are the gate — run both after changes.
`npm run cf-typegen` regenerates `worker-configuration.d.ts` (git-ignored)
after any binding change in `wrangler.jsonc` — it's what makes `env.DB` etc.
type-check; re-run it if editing bindings and typecheck starts complaining
about `Env`.

## Branching

`master` is the trunk — the only long-lived branch, kept deployable at all
times, and what a fresh clone starts on. There's no separate `main`/`dev`
split. Work that isn't a trivial one-liner happens on its own short-lived
branch cut from `master`, named `<type>/<kebab-case-summary>` using the same
`type`s as commit subjects (see "Commit messages" in README.md) — e.g.
`feat/pro-tier-checkout`, `fix/fact-endpoint-cors`. Nothing is too small to
not merit its own branch. Keep commits on the branch following Conventional
Commits same as anywhere else.

The intent is trunk-based development: merge back into `master` small and
often rather than letting a branch drift for weeks. Functionality that isn't
production-ready yet ships behind a feature flag instead of staying unmerged
on its own branch, so it can land on `master` — and get deployed — early,
without being exposed to users. (No feature-flag mechanism exists yet — add
one, e.g. a `FEATURES` env var checked at the top of a route, the first time
something actually needs it; don't build it speculatively.)

Even with that "merge small and often" intent, Claude Code still asks before
actually merging a branch itself — that cadence describes the team's own
practice, not a standing authorization to merge autonomously. If asked to
implement something on a new branch, create the branch and commit to it, and
leave merging it into `master` as a separate, explicitly-requested step.

**Never rebase or force-push a branch that's already been pushed to the
remote** — not even to resolve a merge conflict against `master`, and not
even when the rebase looks "safe". Rewriting already-pushed history moves the
ground out from under anything anchored to the old commits: open PR review
threads, in-flight CI runs, any other clone that's pulled the branch. Resolve
a conflict by merging `master` into the branch instead (`git merge
origin/master`, resolve, commit, push normally) — a merge commit, not
rewritten history. If rebasing still seems like the right call for some other
reason, ask first, the same way merging into `master` itself needs asking.

## Repository conventions

- **Feature-first-ish, but this is a small single-worker app** — `src/routes/`
  for API route handlers, `src/pages/` for landing-page JSX components,
  `src/lib/` for anything talking to a binding (D1 today). Don't over-organize
  ahead of actual size; this is a landing page and one endpoint, not a large app.
- `src/index.tsx` stays a bare entrypoint — mounts `routes/api.ts` at `/api/v1`
  and the landing page at `/`, plus a global `app.onError` that turns any
  unhandled exception (e.g. a D1 query against a missing/un-migrated table)
  into the same deadpan JSON shape as the API's own handled error cases,
  rather than Hono's bare default 500. It logs the real error via
  `console.error` first — visible in `wrangler dev`/`wrangler tail` — the
  response itself never includes the underlying error. Route logic still
  belongs in `routes/`, not here; this is the one thing that's genuinely
  app-wide.
- **API docs are real, not decorative.** `src/lib/openapi.ts` is a
  hand-written OpenAPI 3.0 document (no `@hono/zod-openapi` or similar —
  there's exactly one endpoint, generating the spec from route definitions
  would be solving a problem this app doesn't have), served as JSON at
  `GET /api/v1/openapi.json` (`routes/api.ts`) and rendered via
  `@hono/swagger-ui` at `/docs` (`src/index.tsx` — the nav's "API" link
  points here, not at the raw endpoint). "Try it out" in the Swagger UI
  hits the real live endpoint. Keep `openapi.ts` in sync by hand whenever
  `routes/api.ts`'s response shape changes — nothing enforces that
  automatically at this scale.
- Every pricing tier (Free/Pro/Enterprise) hits the **exact same** endpoint and
  handler — the pricing page is cosmetic. Don't add real tier-gating to
  `routes/api.ts` unless explicitly asked to build that as a real feature (at
  which point the "parody" framing of the brief should probably be revisited
  with whoever's driving, not assumed away quietly).
- The free tier's "3 useless facts/day" is advertised via response headers
  (`X-RateLimit-Limit`/`X-RateLimit-Remaining`, hardcoded in
  `routes/api.ts`) and **deliberately not enforced** — see the brief's "API
  sketch" section. That's a joke, not an oversight; don't "fix" it by adding
  real rate limiting without being asked.
- `src/config.ts`'s `BUY_ME_A_COFFEE_HANDLE` (`handiman`) is the single
  source for the "Sponsor an Endpoint" button's link — every place the button
  appears reads `BUY_ME_A_COFFEE_URL` from that one file; don't hardcode a
  buymeacoffee.com link anywhere else.
- **`COMPANY_NAME`/`COMPANY_URL`/`COMPANY_LOCATION` in `src/config.ts` are
  the one genuinely real thing on the page** — a "Built by Becker Solutions
  (Sweden)" credit in the footer (`.built-by` in `styles.ts`), deliberately
  styled distinctly from the in-character `© 2026 UIaaS...` line above it
  (its own divider, muted rather than brand-colored) so it doesn't read as
  part of the joke. `COMPANY_LOCATION` disambiguates from an unrelated
  "Becker Solutions" elsewhere (Germany) — keep it even if the wording
  around it changes. This project is meant to be shown off (CV, LinkedIn) —
  don't fold this credit
  into the parody copy or remove it without being asked.

## Facts data (D1)

- `migrations/` is the schema — the one `facts` table: `id`, `fact`,
  `usefulness`, `approved` (0001 + 0002, see below). `seed.sql` is curated
  starter content, loaded **separately** from migrations (`npm run
  db:seed:local`/`db:seed:remote`) — it's data, not schema, so it doesn't get
  a migration file of its own. Re-running it against a non-empty table
  duplicates rows; clear the table first if that's not wanted.
- **`approved` (0002) gates a fact behind manual review before `GET /fact`
  will ever serve it** — `getRandomFact` in `src/lib/facts.ts` filters on
  `WHERE approved = TRUE`. The column defaults to `FALSE`; `seed.sql` sets
  it explicitly to `TRUE` on every curated row (it isn't crowd-submitted, so
  it should be visible immediately) — a future addition to `seed.sql` needs
  to do the same, or the row will silently never show up. `POST /fact`
  (`routes/api.ts`, `submitFact` in `lib/facts.ts`) is the only other way a
  row gets created, and it's open to anyone with no authentication — the
  unapproved-by-default gate is what stops a flood from ever reaching a
  reader. There's no admin UI to actually approve a submission yet — that's
  direct DB access (`wrangler d1 execute`) for now.
- **`POST /fact` is also rate-limited for real** — `SUBMIT_RATE_LIMITER` in
  `wrangler.jsonc` is a native Workers rate-limit binding (`ratelimits`,
  `simple: { limit: 5, period: 60 }`), keyed on `CF-Connecting-IP` in
  `routes/api.ts`. This is a second, independent layer from the moderation
  gate above, not the same protection twice — moderation stops a flood from
  becoming visible, the rate limit stops it from being written at all. It's
  real (returns 429 + `Retry-After`), unlike the free tier's advertised-only
  headers on `GET /fact` — don't confuse the two or assume this one is a
  joke too. The binding's `period` is fixed by the platform to 10 or 60
  seconds (burst protection, not a "N per day" quota) and needs no zone or
  custom domain — it works on the `*.workers.dev` deployment too. Verified
  in `test/api.test.ts` against the real binding (Miniflare simulates it
  locally) — each test scenario uses its own synthetic `CF-Connecting-IP`
  so unrelated cases don't share a bucket.
- **`usefulness` is the Negative Usefulness Index™** — zero or lower, enforced
  by a `CHECK (usefulness <= 0)` constraint on the column (0 is the *best* a
  fact can score: perfectly useless, as advertised). `uselessnessLabel()` in
  `src/lib/facts.ts` buckets a score into a human label by threshold (`<= -5`,
  `<= -3`, `<= -1`, else `0`) — see its doc comment for the exact copy, which
  the API response's `uselessness_label` field and `seed.sql`'s own comments
  both reuse. Score new facts using that same four-tier scale for consistency,
  not an arbitrary negative number.
- `migrations/0001_create_facts_table.sql` had the `CHECK` constraint added
  directly to it (not a new `0002` migration) — at the time, `wrangler d1
  migrations list uiaas-db --remote` confirmed 0001 had never actually been
  applied to the real D1 database, so there was no shipped state to preserve.
  **That reasoning doesn't carry forward**: the next schema change, once 0001
  has genuinely been applied somewhere, needs its own new migration file —
  same "don't rewrite what's already shipped" principle as the branching
  section's rule against rebasing pushed branches, just for D1 instead of git.
  If unsure whether 0001 has been applied remotely, check with that same
  `wrangler d1 migrations list uiaas-db --remote` command rather than assuming
  either way. The `approved` column (below) is the first change made under
  this rule — `0002_add_approved_column.sql` is a genuine new migration
  (`ALTER TABLE` + a backfill `UPDATE`), not a further edit to 0001.
- The plan (per the brief and how this was scoped when scaffolded) is to keep
  growing the curated fact list over time — `seed.sql` went from 15 to 30
  rows in one pass already — either more curated rows or a one-off fetch
  from an external source, loaded the same way, not by adding a live
  external API call to the request path. `getRandomFact` in
  `src/lib/facts.ts` uses `ORDER BY RANDOM() LIMIT 1`, a full-table scan —
  fine at a curated-list size, reconsider if the table ever grows to
  genuinely large (thousands+) rows.
- **Growing `seed.sql` after it's already been run somewhere doesn't mean
  re-running the whole file** — that duplicates every row already loaded
  (see the note at the top of `seed.sql` itself). Append the new rows to
  `seed.sql` (so a *fresh* database gets the complete list from one run),
  then apply just the new rows by hand to any database that's already
  seeded — a one-off `INSERT` with only the delta, via `wrangler d1 execute
  --file`, not `npm run db:seed:*`. That's how the second batch of 15 (bringing
  the total to 30) was actually loaded onto the real remote database.
- `toPublicFactId` in the same file formats the row's autoincrement `id` as
  the public `uiaas_00042`-style id — the public id is derived, not stored.
- **The "Enterprise has a higher average Negative Usefulness Index than
  Free" line on the pricing card is copy only** (`src/pages/Landing.tsx`,
  `PRICING_TIERS`) — there's no actual per-tier scoring behind it, matching
  "every tier hits the exact same endpoint" above. Don't wire up real
  tier-aware fact selection to make that claim literally true unless asked.

## Testing

Tests run **inside the Workers runtime** via `@cloudflare/vitest-plugin`
(`vitest.config.ts`), not in plain Node — `test/api.test.ts` calls the
worker's own `fetch` handler and a real (local, in-memory-per-test) D1
instance. A few non-obvious things learned getting this working, worth
knowing before touching test setup:

- **The package is `@cloudflare/vitest-plugin`, not the older
  `@cloudflare/vitest-pool-workers`.** Both exist on npm; `vitest-pool-workers`
  is the predecessor whose `defineWorkersConfig`/`config` entry point is gone
  as of its own latest version too (it moved to the same
  plugin-based API this project uses) — don't reach for it or for
  `defineWorkersConfig` from old examples. Both packages are explicitly
  flagged `"workers-sdk": { "prerelease": true }` in their own `package.json`
  — expect their API to keep moving; re-check `node_modules/@cloudflare/vitest-plugin/dist/pool/index.d.mts`'s
  own `export { ... }` line for what's actually available before trusting an
  online example (including this file's own advice, if enough time has
  passed).
- **`vitest.config.ts` uses the `cloudflareTest` Vite plugin**, not a wrapped
  `defineConfig` from a `/config` subpath:
  ```ts
  import { defineConfig } from 'vitest/config';
  import { cloudflareTest } from '@cloudflare/vitest-plugin';
  export default defineConfig({
    plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' } })],
  });
  ```
- **Migrations are loaded into a test via a `?raw` import, not
  `readD1Migrations`/`applyD1Migrations`.** Those two functions exist and are
  exported, but `readD1Migrations` is meant to run in a pure-Node context —
  importing it inside a test file (which itself runs *inside* workerd) drags
  the entire `miniflare` package into the worker's own module graph, which
  crashes workerd trying to resolve `node:process`/`node:tty`/etc. via its
  module fallback service (confirmed while scaffolding this project — not a
  hypothetical). Instead, `test/api.test.ts` does:
  ```ts
  import createFactsTable from '../migrations/0001_create_facts_table.sql?raw';
  await env.DB.prepare(createFactsTable).run();
  ```
  Vite's `?raw` suffix inlines the file as a string at build time — no
  runtime `fs` call, so it works from code that ends up running inside
  workerd. `test/sql-raw.d.ts` supplies the ambient module type
  (`*.sql?raw`) TypeScript needs for this.
- **Use `.prepare(sql).run()` to apply a migration, not `.exec(sql)`.**
  D1's `.exec()` splits its input naively on newlines and expects one
  complete statement per line — it chokes on a leading multi-line SQL
  comment (which every migration here starts with) and on a `CREATE TABLE`
  spanning multiple lines. `.prepare()` does a real parse and handles both
  fine. Add future migrations following the same shape (a comment header,
  then normal multi-line SQL) — this constraint is about D1's `.exec()`, not
  something the migration files need to work around themselves.
- **A migration with more than one statement needs each one `.prepare()`d
  separately** — `.prepare()` only parses one statement per call, so
  `test/api.test.ts` splits a multi-statement migration's raw SQL on `;`
  and runs each piece. Comment lines are stripped *before* that split, not
  after — a plain English sentence in a comment (e.g. "...unapproved; the
  curated rows...", hit for real writing 0002's own header comment) contains
  a `;` too, and splitting on it mid-comment produces a fragment with no
  actual statement, which D1 rejects with "SQL code did not contain a
  statement." Splitting only what's left after stripping `--`-prefixed
  lines avoids this regardless of what a future migration's comments say.
- Prefer `cloudflare:workers`' `env`/`exports` over `cloudflare:test`'s
  `env`/`SELF` — the latter are marked `@deprecated` in
  `@cloudflare/vitest-plugin`'s own type declarations (still functional, just
  the old names). This project's test calls the worker via
  `import { env, exports as workerExports } from 'cloudflare:workers';
  workerExports.default.fetch(new Request(url))`.
- Hono's JSX resolves named HTML entities written literally in a component
  (e.g. `don&rsquo;t`) to their actual Unicode character (`don’t`) at
  render time — a test asserting on rendered HTML should match the real
  Unicode character, not the entity spelling from the source `.tsx`.

## Platform config

- `wrangler.jsonc`'s `database_id` starts as the placeholder
  `REPLACE_WITH_D1_DATABASE_ID` — swap in the real id after `wrangler d1
  create uiaas-db` (see README "Setup"). Local dev (`npm run dev`,
  `db:*:local`, `npm test`) all work fine against the placeholder; only
  `db:*:remote` and `deploy` need the real one.
- `worker-configuration.d.ts` is generated (`npm run cf-typegen`) and
  git-ignored, matching current Cloudflare guidance to generate runtime types
  from `wrangler types` rather than depend on the separate
  `@cloudflare/workers-types` package (this project doesn't have that
  dependency at all — global `D1Database` etc. types come from the generated
  file).
- `compatibility_date` should track roughly the date this was last bumped,
  not drift indefinitely — update it deliberately, not as a side effect of an
  unrelated change.
- **`routes` in `wrangler.jsonc` points this Worker at
  `uiaas.becker-consulting.se`** (`custom_domain: true`) — Cloudflare
  provisions the DNS record and SSL cert on deploy; the only prerequisite is
  `becker-consulting.se` already being an active zone on the same Cloudflare
  account, nothing else needed in this repo. The `*.workers.dev` URL keeps
  working alongside the custom domain — `routes` adds to that, it doesn't
  replace it, unless `workers_dev` is explicitly set to `false`.

## CI/CD

`.github/workflows/ci.yml` — a `test` job (`npm run cf-typegen && npm run
typecheck && npm test`) on every push and PR against `master`, plus, only
for a push to `master` that passes `test`, a `deploy` job running `npm run
db:migrate:remote` then `wrangler deploy` directly (unlike the sibling
`wild-swimmer-app` repo's CI, which deploys by dispatching a workflow in a
separate site repo — `uiaas` deploys itself, there's no separate site repo
to hand off to). `cf-typegen` is a CI-only step here (see "Platform config"
below on why `worker-configuration.d.ts` is never committed) — it doesn't
run in the `deploy` job, since `wrangler deploy` bundles with esbuild and
never runs `tsc` itself.

**`db:migrate:remote` runs on every deploy; `db:seed:remote` never does.**
`wrangler d1 migrations apply` is idempotent — it only applies migrations
not already recorded as run — so it's safe unconditionally. `seed.sql`
isn't: re-running it duplicates rows (see "Facts data (D1)" above), so
seeding stays a manual, one-time step, never wired into CI. Confirmed
`wrangler d1 migrations apply --remote` skips its interactive confirmation
prompt automatically in a non-interactive/CI context (its own `--help`
documents this — still takes a backup first either way) — no extra flag
needed to make this safe to run unattended.

Needs two repo secrets to actually deploy: `CLOUDFLARE_API_TOKEN` (scoped to
this account, "Workers Scripts: Edit" at minimum) and `CLOUDFLARE_ACCOUNT_ID`.
Editing `ci.yml`'s `deploy` job is a change to what triggers a production
deploy on every merge to `master` — treat it with the same care as touching
`wrangler.jsonc` itself.
