import { env, exports as workerExports } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { MAX_FACT_LENGTH, uselessnessLabel } from '../src/lib/facts';
// `?raw` inlines each migration's SQL as a string at build time, so setting
// up the test database needs no runtime filesystem access (unavailable
// inside the Workers runtime these tests execute in) — see migrations/,
// the single source of truth for this schema.
import createFactsTable from '../migrations/0001_create_facts_table.sql?raw';
import addApprovedColumn from '../migrations/0002_add_approved_column.sql?raw';

beforeAll(async () => {
  // `.prepare()` (a real SQL parse) rather than `.exec()` — `.exec()` splits
  // naively on newlines and chokes on a migration's leading comment block
  // and multi-line statements. 0002 has two statements in one file, so
  // comment lines are stripped and what's left is split on `;` and run
  // separately — `.prepare()` only ever parses one statement per call.
  // (Stripping comments first matters: a `;` inside a comment — e.g. an
  // ordinary sentence — would otherwise split mid-comment and break this.)
  await env.DB.prepare(createFactsTable).run();
  const statements = addApprovedColumn
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
  await env.DB
    .prepare('INSERT INTO facts (fact, usefulness, approved) VALUES (?, 0, TRUE)')
    .bind('Test fact for the test suite.')
    .run();
});

describe('GET /api/v1/fact', () => {
  it('returns a fact shaped like the documented API response', async () => {
    const res = await workerExports.default.fetch(new Request('https://example.com/api/v1/fact'));
    expect(res.status).toBe(200);

    const body = await res.json<{
      fact: string;
      usefulness: number;
      uselessness_label: string;
      id: string;
      tier_required: string;
    }>();
    expect(typeof body.fact).toBe('string');
    expect(body.fact.length).toBeGreaterThan(0);
    expect(body.usefulness).toBe(0);
    expect(body.uselessness_label).toBe('Perfectly useless, as advertised.');
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

describe('Negative Usefulness Index™', () => {
  it('rejects a fact with a positive usefulness score', async () => {
    await expect(
      env.DB.prepare('INSERT INTO facts (fact, usefulness) VALUES (?, ?)').bind('This fact is, regrettably, useful.', 1).run(),
    ).rejects.toThrow(/CHECK constraint failed/);
  });

  it('accepts zero and negative scores', async () => {
    const result = await env.DB.prepare('INSERT INTO facts (fact, usefulness) VALUES (?, ?)')
      .bind('This fact is exactly as useless as it needs to be.', -5)
      .run();
    expect(result.success).toBe(true);
  });

  it.each([
    [0, 'Perfectly useless, as advertised.'],
    [-1, 'You will bring this up at a dinner party and regret it.'],
    [-2, 'You will bring this up at a dinner party and regret it.'],
    [-3, 'This fact will replace something useful you used to know.'],
    [-4, 'This fact will replace something useful you used to know.'],
    [-5, 'Legally you cannot un-know this.'],
    [-100, 'Legally you cannot un-know this.'],
  ])('labels a score of %i as %j', (score, label) => {
    expect(uselessnessLabel(score)).toBe(label);
  });
});

describe('Approval gating', () => {
  it('never returns an unapproved fact from GET /fact', async () => {
    await env.DB.prepare('INSERT INTO facts (fact, usefulness) VALUES (?, 0)').bind('UNAPPROVED_SENTINEL_FACT').run();

    const row = await env.DB.prepare('SELECT approved FROM facts WHERE fact = ?').bind('UNAPPROVED_SENTINEL_FACT').first<{
      approved: number;
    }>();
    expect(row?.approved).toBe(0); // approved defaults to FALSE (0) when not specified on insert

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => workerExports.default.fetch(new Request('https://example.com/api/v1/fact'))),
    );
    for (const res of responses) {
      const body = await res.json<{ fact: string }>();
      expect(body.fact).not.toBe('UNAPPROVED_SENTINEL_FACT');
    }
  });
});

describe('POST /api/v1/fact', () => {
  it('accepts a submission, queues it for review, and never serves it via GET', async () => {
    const submitRes = await workerExports.default.fetch(
      new Request('https://example.com/api/v1/fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact: 'SUBMITTED_SENTINEL_FACT' }),
      }),
    );
    expect(submitRes.status).toBe(201);

    const body = await submitRes.json<{ id: string; status: string; message: string }>();
    expect(body.id).toMatch(/^uiaas_\d{5}$/);
    expect(body.status).toBe('pending_review');
    expect(typeof body.message).toBe('string');

    const stored = await env.DB.prepare('SELECT usefulness, approved FROM facts WHERE fact = ?')
      .bind('SUBMITTED_SENTINEL_FACT')
      .first<{ usefulness: number; approved: number }>();
    expect(stored?.usefulness).toBe(0);
    expect(stored?.approved).toBe(0);

    const getRes = await workerExports.default.fetch(new Request('https://example.com/api/v1/fact'));
    const getBody = await getRes.json<{ fact: string }>();
    expect(getBody.fact).not.toBe('SUBMITTED_SENTINEL_FACT');
  });

  it.each([
    ['missing the "fact" field entirely', {}],
    ['an empty string', { fact: '' }],
    ['a whitespace-only string', { fact: '   ' }],
    ['a non-string value', { fact: 42 }],
    ['a fact longer than the maximum length', { fact: 'x'.repeat(MAX_FACT_LENGTH + 1) }],
  ])('rejects a submission with %s', async (_label, payload) => {
    const res = await workerExports.default.fetch(
      new Request('https://example.com/api/v1/fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects a non-JSON request body', async () => {
    const res = await workerExports.default.fetch(
      new Request('https://example.com/api/v1/fact', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'not json',
      }),
    );
    expect(res.status).toBe(400);
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

describe('API docs', () => {
  it('serves the OpenAPI spec describing GET /fact', async () => {
    const res = await workerExports.default.fetch(new Request('https://example.com/api/v1/openapi.json'));
    expect(res.status).toBe(200);

    const spec = await res.json<{ openapi: string; paths: Record<string, unknown> }>();
    expect(spec.openapi).toBe('3.0.3');
    expect(spec.paths).toHaveProperty('/fact');
  });

  it('serves Swagger UI at /docs, pointed at the real spec', async () => {
    const res = await workerExports.default.fetch(new Request('https://example.com/docs'));
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('swagger-ui');
    expect(html).toContain('/api/v1/openapi.json');
  });
});
