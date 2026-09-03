import { Hono } from 'hono';
import type { Env } from './types';
import { api } from './routes/api';
import { Landing } from './pages/Landing';

const app = new Hono<{ Bindings: Env }>();

app.route('/api/v1', api);

app.get('/', (c) => c.html(<Landing />));

export default app;
