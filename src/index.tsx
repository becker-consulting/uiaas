import { Hono } from 'hono';
import type { Env } from './types';
import { api } from './routes/api';
import { Landing } from './pages/Landing';

const app = new Hono<{ Bindings: Env }>();

app.route('/api/v1', api);

app.get('/', (c) => c.html(<Landing />));

// Catches anything a route didn't handle itself (e.g. a D1 error from a
// missing table/column) so a visitor gets deadpan JSON instead of Hono's
// bare default 500. The real error still goes to the Worker's own logs
// (visible via `wrangler tail`/`wrangler dev`) — just not to the response.
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Something broke. Enterprise support has been notified (it has not).' }, 500);
});

export default app;
