/** Bindings available on `c.env` — kept in sync with `wrangler.jsonc`. */
export type Env = {
  DB: D1Database;
  SUBMIT_RATE_LIMITER: RateLimit;
};
