import { exports as workerExports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

describe('unexpected errors', () => {
  it('returns a deadpan 500 instead of leaking the underlying error', async () => {
    // Deliberately no migration applied in this file (each test file gets
    // its own isolated D1 storage — see "Testing" in CLAUDE.md) — env.DB has
    // no `facts` table, so the route's query throws and app.onError
    // (src/index.tsx) is what's actually under test here, the same failure
    // mode as a missing/un-migrated local database.
    const res = await workerExports.default.fetch(new Request('https://example.com/api/v1/fact'));
    expect(res.status).toBe(500);

    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('Something broke. Enterprise support has been notified (it has not).');
  });
});
