import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';

import { authRoutes } from './routes/auth';
import { botsRoutes } from './routes/bots';
import { webhooksRoutes } from './routes/webhooks';
import { inboxRoutes } from './routes/inbox';
import { automationsRoutes } from './routes/automations';

const app = new OpenAPIHono();

// Global CORS
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://botforge1.pages.dev',
    'https://*.botforge1.pages.dev',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Endpoints
app.route('/api/auth', authRoutes);
app.route('/api/bots', botsRoutes);
app.route('/api/webhooks', webhooksRoutes);

app.route('/api', inboxRoutes);
app.route('/api', automationsRoutes);

// Swagger
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: { version: '1.0.0', title: 'BotForge Endpoints' }
});
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

// Export for Cloudflare Workers
export default app;
