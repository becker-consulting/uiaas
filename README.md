# UIaaS — Useless Information as a Service

A parody SaaS product in the "Kittens as a Service" tradition: full corporate
startup packaging — hero section, mission statement, pricing tiers, a
versioned API — around a product that provides absolutely no value. The API
returns random, entirely useless facts. Everything else (pricing tiers, an
"Enterprise" plan, a fake rate limit) is played completely straight. See
[uiaas-brief.md](uiaas-brief.md) for the original concept brief.

**Live product:** `GET /api/v1/fact`

```json
{
  "fact": "The inventor of the frisbee was turned into a frisbee after he died — his ashes were molded into memorial discs.",
  "usefulness": -5,
  "uselessness_label": "Legally you cannot un-know this.",
  "id": "uiaas_00015",
  "tier_required": "any"
}
```

`usefulness` is the Negative Usefulness Index™ — always zero or lower (a D1
`CHECK` constraint enforces it), scored per fact in `seed.sql`.

Anyone can also submit a fact — `POST /api/v1/fact` with `{"fact": "..."}` —
but a submission never shows up via `GET /fact` immediately. It lands
unapproved (a D1 `approved` column, defaulting to `false`) and needs manual
review first; there's no admin UI for that yet, just direct DB access.
Submissions are also genuinely rate-limited (5 per 60 seconds per IP, a
native Cloudflare Workers rate limit binding — a 6th attempt gets a real
`429`, not an advertised-only header like the free tier's joke on `GET
/fact`).

```json
{
  "id": "uiaas_00016",
  "status": "pending_review",
  "message": "Submission received and entered into editorial review. Published submissions are selected at UIaaS's sole discretion."
}
```

Full interactive API docs (Swagger UI, generated from a real OpenAPI 3.0
spec — "Try it out" hits the actual live endpoint) are at `/docs`.

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

**Getting a 500 from `/api/v1/fact`?** The local D1 database lives in
`.wrangler/state/` and persists across `wrangler dev` restarts on its own —
but it's git-ignored and gone if that folder's ever deleted (e.g. clearing
local state, or a fresh checkout). Re-run `npm run db:migrate:local && npm
run db:seed:local` to restore it. An unhandled D1 error (missing table
included) surfaces as `{"error": "Something broke. Enterprise support has
been notified (it has not)."}` — see `app.onError` in `src/index.tsx` — never
a bare unhandled exception.

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

The merge commit that lands a branch on `master` follows the same format too
— `git merge --no-ff` drops in a bare "Merge \<branch\> into master" by
default, but that gets typed over with a real `<type>: <Summary>` (usually
`chore:`, since the merge itself isn't the user-facing change — that already
happened in the branch's own commits) before it's kept.

## Project layout

```
src/
  index.tsx        — Hono app entry: mounts the API, the landing page, /docs
  routes/api.ts     — GET/POST /api/v1/fact, GET /api/v1/openapi.json
  pages/Landing.tsx — the whole landing page (hero, pricing, demo, footer)
  pages/styles.ts   — inlined CSS for the landing page
  lib/facts.ts      — D1 access: a random approved fact, submitting a new one
  lib/openapi.ts    — hand-written OpenAPI 3.0 spec, backs Swagger UI at /docs
  config.ts         — Buy Me a Coffee handle + the real Becker Solutions credit
  types.ts          — Env (bindings) type
migrations/          — D1 schema migrations (npm run db:migrate:*)
seed.sql              — curated starter facts, loaded separately from migrations
test/                 — vitest, runs inside the Workers runtime
```

## Approving a submission

`POST /api/v1/fact` is open to anyone and never publishes immediately —
there's no admin UI yet, just direct DB access:

```bash
npx wrangler d1 execute uiaas-db --remote \
  --command "UPDATE facts SET approved = TRUE WHERE id = <row id>"
```

(`--local` against the dev database instead, while testing.) Worth setting
`usefulness` at the same time — a submission always lands scored `0`, since
scoring on the Negative Usefulness Index™ is an editorial call, not
something a submitter sets for themselves.

## Deployment

Live at [uiaas.becker-consulting.se](https://uiaas.becker-consulting.se)
(`routes` in `wrangler.jsonc`, `custom_domain: true` — needs
`becker-consulting.se` already set up as a zone on the Cloudflare account;
nothing else to configure) as well as the usual `*.workers.dev` URL.

`.github/workflows/ci.yml` runs typecheck + test on every push/PR against
`master`, and deploys (`wrangler deploy`) on a passing push to `master` —
needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repo secrets.
`npm run deploy` also works by hand (needs `wrangler login` and a real
`database_id` in `wrangler.jsonc`).

## Sponsor an Endpoint

The button links to `https://buymeacoffee.com/handiman`, set via
`BUY_ME_A_COFFEE_HANDLE` in [src/config.ts](src/config.ts) — every place the
button appears reads from that one constant, so a rename only means changing
it there.
