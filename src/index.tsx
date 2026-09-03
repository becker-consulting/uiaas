import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import type { Env } from './types';
import { api } from './routes/api';
import { Landing } from './pages/Landing';
import { ogImageSvg } from './pages/ogImage';

const app = new Hono<{ Bindings: Env }>();

app.route('/api/v1', api);

app.get('/', (c) => c.html(<Landing />));

// The nav's "API" link — real Swagger UI against the real spec at
// /api/v1/openapi.json (routes/api.ts), not a link straight to the raw
// endpoint. Wired here rather than in routes/api.ts since it renders HTML
// for a top-level page, the same reason "/" is wired directly above.
app.get('/docs', swaggerUI({ url: '/api/v1/openapi.json', title: 'UIaaS API Docs' }));

// The landing page's og:image/twitter:image target (Landing.tsx's <head>).
// Static content — same bytes every request — so it's fine to let it be
// cached rather than regenerated per request.
app.get('/og-image.svg', (c) => {
  c.header('Cache-Control', 'public, max-age=3600');
  return c.body(ogImageSvg, 200, { 'Content-Type': 'image/svg+xml' });
});

// Catches anything a route didn't handle itself (e.g. a D1 error from a
// missing table/column) so a visitor gets deadpan JSON instead of Hono's
// bare default 500. The real error still goes to the Worker's own logs
// (visible via `wrangler tail`/`wrangler dev`) — just not to the response.
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Something broke. Enterprise support has been notified (it has not).' }, 500);
});

export default app;
