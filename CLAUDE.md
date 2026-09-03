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
l next to "aaS", so the brand name reads wrong at a glance. Fixed two ways,
both in `Landing.tsx`: the nav wordmark wraps "UI" in `.logo-mark` (a solid
badge — unambiguous since it's not relying on the glyph at all), and the
`Brand` component (`<Brand />`) gives "UI" alone `.brand-ui`'s color+weight
wherever the name appears in running body text (Mission blurb, footer
copyright). Use `<Brand />` for any new visible "UIaaS" occurrence instead of
typing the plain string — a `<title>`/`<meta>` value is the one exception,
since those never render as on-page glyphs and don't hit this at all.

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

- `migrations/` is the schema (currently just the one `facts` table: `id`,
  `fact`, `usefulness`). `seed.sql` is curated starter content, loaded
  **separately** from migrations (`npm run db:seed:local`/`db:seed:remote`)
  — it's data, not schema, so it doesn't get a migration file of its own.
  Re-running it against a non-empty table duplicates rows; clear the table
  first if that's not wanted.
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
  either way.
- The plan (per the brief and how this was scoped when scaffolded) is to grow
  the fact list beyond the ~15-row seed later — either more curated rows or a
  one-off fetch from an external source, loaded the same way `seed.sql` is,
  not by adding a live external API call to the request path. `getRandomFact`
  in `src/lib/facts.ts` uses `ORDER BY RANDOM() LIMIT 1`, a full-table scan —
  fine at a curated-list size, reconsider if the table ever grows to genuinely
  large (thousands+) rows.
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

## No CI yet

There's no GitHub remote or `.github/workflows/` yet — this was scaffolded
locally first. Add CI (typecheck + test on push/PR, deploy on a passing push
to `master`, mirroring the pattern in the sibling `wild-swimmer-app` repo's
`CLAUDE.md`) once there's a remote worth protecting, not before.
