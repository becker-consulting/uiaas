import { env, exports as workerExports } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
// `?raw` inlines the migration's SQL as a string at build time, so setting
// up the test database needs no runtime filesystem access (unavailable
// inside the Workers runtime these tests execute in) — see
// migrations/0001_create_facts_table.sql, the single source of truth for
// this schema.
import createFactsTable from '../migrations/0001_create_facts_table.sql?raw';

beforeAll(async () => {
  // `.prepare()` (a real SQL parse) rather than `.exec()` — `.exec()` splits
  // naively on newlines and chokes on the migration's leading comment block
  // and multi-line CREATE TABLE.
  await env.DB.prepare(createFactsTable).run();
  await env.DB.prepare('INSERT INTO facts (fact, usefulness) VALUES (?, 0)').bind('Test fact for the test suite.').run();
});

describe('GET /api/v1/fact', () => {
  it('returns a fact shaped like the documented API response', async () => {
    const res = await workerExports.default.fetch(new Request('https://example.com/api/v1/fact'));
    expect(res.status).toBe(200);

    const body = await res.json<{ fact: string; usefulness: number; id: string; tier_required: string }>();
    expect(typeof body.fact).toBe('string');
    expect(body.fact.length).toBeGreaterThan(0);
    expect(body.usefulness).toBe(0);
    expect(body.id).toMatch(/^uiaas_\d{5}$/);
    expect(body.tier_required).toBe('any');
  });

  it('advertises but does not enforce the free-tier rate limit', async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () => workerExports.default.fetch(new Request('https://example.com/api/v1/fact'))),
    );
    for (const res of responses) {
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('3');
    }
  });
});

describe('GET /', () => {
  it('serves the landing page with the confirmed hero copy', async () => {
    const res = await workerExports.default.fetch(new Request('https://example.com/'));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('What don’t you need to know today?');
    expect(html).toContain('Providing useless information since 2026.');
  });
});
