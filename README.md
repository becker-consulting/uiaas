# UIaaS — Useless Information as a Service

A parody SaaS product in the "Kittens as a Service" tradition: full corporate
startup packaging — hero section, mission statement, pricing tiers, a
versioned API — around a product that provides absolutely no value. The API
returns random, entirely useless facts. Everything else (pricing tiers, an
"Enterprise" plan, a fake rate limit) is played completely straight. See
[uiaas-brief.md](uiaas-brief.md) for the original concept brief.

**Live product, one endpoint:** `GET /api/v1/fact`

```json
{
  "fact": "Honey never spoils — edible honey has been found in 3,000-year-old Egyptian tombs.",
  "usefulness": 0,
  "id": "uiaas_00003",
  "tier_required": "any"
}
```

## Stack

- [Hono](https://hono.dev/) + TypeScript, deployed as a single Cloudflare Worker.
- [D1](https://developers.cloudflare.com/d1/) for the fact list (a curated seed to start —
  see `seed.sql` — with room to pull in more from an external source later).
- The landing page is server-rendered via `hono/jsx`, styles inlined — no separate
  frontend build step, no Workers Static Assets binding. Revisit that if the site
  ever grows past one page.
- [Vitest](https://vitest.dev/) via `@cloudflare/vitest-plugin`, running tests inside
  the actual Workers runtime.

## Setup

```bash
npm install

# One-time: create the D1 database and wire it up
npx wrangler login
npx wrangler d1 create uiaas-db
# → copy the returned database_id into wrangler.jsonc's d1_databases[0].database_id

# Apply the schema and load the starter facts
npm run db:migrate:local   # local dev database
npm run db:seed:local
npm run db:migrate:remote  # the real D1 database, once database_id is filled in
npm run db:seed:remote

npm run dev                # wrangler dev — http://localhost:8787
```

`npm run dev` works against the **local** D1 database without any Cloudflare
account — only `db:*:remote` and `deploy` need `wrangler login`.

**Port collision heads up:** `wrangler dev` defaults to port 8787. If a sibling
`@becker-solutions` project's own `wrangler dev` is already running, it can win
that port — requests then silently go to *that* worker instead of failing to
connect. If responses look wrong (e.g. a 404 JSON shape this app doesn't
produce), check `netstat -ano | findstr :8787` for more than one process, and
pass `--port` explicitly to run this one on something else.

## Commands

```bash
npm run dev              # wrangler dev, local D1
npm run deploy            # wrangler deploy
npm run typecheck         # tsc --noEmit — must be clean before considering work done
npm test                  # vitest run, inside the Workers runtime — the other gate
npm run test:watch        # vitest, watch mode
npm run cf-typegen        # regenerate worker-configuration.d.ts (git-ignored, run after any wrangler.jsonc binding change)
npm run db:migrate:local  # apply migrations/ to the local D1 database
npm run db:migrate:remote # apply migrations/ to the real D1 database
npm run db:seed:local     # load seed.sql into the local D1 database
npm run db:seed:remote    # load seed.sql into the real D1 database
```

`npm run typecheck` and `npm test` are the gate — run both after changes.

## Commit messages

Conventional Commits — `<type>: <Summary>` — so a changelog can eventually be
generated from history without rewriting it first:

- `feat:` a user-facing capability
- `fix:` a bug fix
- `chore:` tooling, dependencies, config — no product behavior change
- `docs:` documentation only
- `refactor:` internal restructuring, no behavior change
- `test:` test-only change

Same `type`s name each short-lived branch — see [CLAUDE.md](CLAUDE.md#branching).

## Project layout

```
src/
  index.tsx        — Hono app entry: mounts the API and the landing page
  routes/api.ts     — GET /api/v1/fact
  pages/Landing.tsx — the whole landing page (hero, pricing, demo, footer)
  pages/styles.ts   — inlined CSS for the landing page
  lib/facts.ts      — D1 query for a random fact
  config.ts         — Buy Me a Coffee handle (placeholder until an account exists)
  types.ts          — Env (bindings) type
migrations/          — D1 schema migrations (npm run db:migrate:*)
seed.sql              — curated starter facts, loaded separately from migrations
test/                 — vitest, runs inside the Workers runtime
```

## Deployment

`npm run deploy` (needs `wrangler login` and a real `database_id` in
`wrangler.jsonc`). No CI/CD is wired up yet — add a GitHub Actions workflow
(typecheck + test on every push/PR, deploy on a passing push to `master`) once
this has a GitHub remote worth protecting.

## Beg for money

The button links to `https://buymeacoffee.com/handiman`, set via
`BUY_ME_A_COFFEE_HANDLE` in [src/config.ts](src/config.ts) — every place the
button appears reads from that one constant, so a rename only means changing
it there.
