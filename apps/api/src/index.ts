import { OpenAPIHono } from '@hono/zod-openapi';
import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';

import { authRoutes } from './routes/auth';
import { botsRoutes } from './routes/bots';
import { webhooksRoutes } from './routes/webhooks';
import { inboxRoutes } from './routes/inbox';
import { automationsRoutes } from './routes/automations';

const app = new OpenAPIHono();

// Global CORS (para aceptar a Next.js)
app.use('*', cors({
  origin: ['http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Endpoints
app.route('/api/auth', authRoutes);
app.route('/api/bots', botsRoutes);
app.route('/api/webhooks', webhooksRoutes); // Sin JWT auth para Meta

app.route('/api', inboxRoutes); // Tiene su authMiddleware mapeado internamente
app.route('/api', automationsRoutes); // Tiene authMiddleware 

// Swagger
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: { version: '1.0.0', title: 'BotForge Endpoints' }
});
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

serve({ fetch: app.fetch, port: 3001 });
console.log('BotForge API started on http://localhost:3001');
