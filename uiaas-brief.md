# UIaaS — Useless Information as a Service

## Concept

A parody SaaS product in the "Kittens as a Service" tradition: full corporate startup packaging — hero section, mission statement, pricing tiers, API docs — around a product that provides absolutely no value. The API returns random, entirely useless facts. Everything else (pricing, positioning, an "Enterprise" tier) is played completely straight.

The joke only works if the execution is sincere. No wink emoji, no "lol just kidding" — treat it exactly like a real SaaS landing page a real founder would ship.

## Confirmed copy (do not rewrite — build around these)

- **Hero headline:** "What don't you need to know today?"
- **Mission / tagline:** "Providing useless information since 2026."
- **Signature feature:** a "Beg for money" button, prominently placed (donation link — provider TBD, see Open Decisions).

## Optional supporting copy (offered, not yet locked in — feel free to use, drop, or riff on these)

- Sub-hero line: "Enterprise-grade nonsense, delivered instantly."
- Footer / about blurb: "Trusted by absolutely no one."
- Pricing section header: "Plans for every level of pointlessness."

## Core features (MVP)

1. **Fact API** — a single endpoint that returns one random useless fact as JSON (e.g. `GET /api/fact`).
2. **Landing page** — hero section (headline + tagline), a short mission blurb, a pricing section, and the beg-for-money button.
3. **Pricing tiers** — Free / Pro / Enterprise, cosmetically different (price, badge, maybe a fake "SLA"), functionally identical — all three hit the same endpoint.
4. **Beg for money button** — visually prominent, links out to a donation provider.

## API sketch (straw-man — adjust freely)

```
GET /api/v1/fact
```

Response:
```json
{
  "fact": "The world's oceans contain enough gold to give every person on Earth about 4 pounds of it.",
  "usefulness": 0,
  "id": "uiaas_00042",
  "tier_required": "any"
}
```

Play up the fake enterprise seriousness where it's funny: versioned endpoint (`/v1/`), a `usefulness` field hard-coded to `0`, maybe a fake rate-limit header on the free tier ("3 pieces of useless information per day") that doesn't actually get enforced.

## Pricing tiers (parody — same product, different price tag)

- **Free** — "3 useless facts/day." No card required.
- **Pro** — some absurd monthly price for the exact same single endpoint.
- **Enterprise** — "Contact sales." Add a fake SLA line like "99.99% uptime for information you didn't need."

## Open decisions (Henrik to specify when picking this up in Claude Code)

- Tech stack: frontend framework, backend language/runtime, hosting target.
- Where the facts come from: a static curated list, a generated set, or pulled live from a public trivia/facts API.
- Beg-for-money provider: Stripe, PayPal, Buy Me a Coffee, or a plain donation link.
- Domain / deployment target.

## Notes for whoever picks this up

This brief exists because the concept and copy were worked out in a separate chat session that this coding session has no access to — so treat the "Confirmed copy" section as fixed requirements, and everything else as a starting sketch to adjust while building. Keep the tone deadpan throughout: the more seriously the fake SaaS treats itself, the funnier it is.
