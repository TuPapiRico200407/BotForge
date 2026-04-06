import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { BotRepository, db, botWhatsappConfigs, botConfigs, botMembers, users } from '@botforge/infrastructure';
import { authMiddleware } from '../middlewares/auth';
import { botMemberGuard } from '../middlewares/botMemberGuard';
import { getDailyMetrics } from '@botforge/infrastructure';
import { eq } from 'drizzle-orm';

export const botsRoutes = new OpenAPIHono();
const botRepo = new BotRepository();

const getBotsRoute = createRoute({
  method: 'get',
  path: '/',
  middleware: [authMiddleware] as any,
  responses: {
    200: {
      description: 'List user bots',
      content: { 'application/json': { schema: z.any() } }
    }
  }
});

botsRoutes.openapi(getBotsRoute, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const bots = await botRepo.getBotsByUser(payload.sub, payload.role);
  return c.json(bots, 200);
});

const createBotRoute = createRoute({
  method: 'post',
  path: '/',
  middleware: [authMiddleware] as any,
  request: {
    body: {
      content: { 'application/json': { schema: z.object({ name: z.string().min(3) }) } }
    }
  },
  responses: {
    201: { description: 'Bot created', content: { 'application/json': { schema: z.any() } } }
  }
});

botsRoutes.openapi(createBotRoute, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const { name } = c.req.valid('json');
  
  const bot = await botRepo.createBot(name, payload.sub);
  return c.json(bot, 201);
});



botsRoutes.get('/:id/config/whatsapp', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const botId = c.req.param('id');
  
  // Minimal check (MVP: assume access if jwt and same system)
  let config = await db.select().from(botWhatsappConfigs).where(eq(botWhatsappConfigs.botId, botId)).limit(1);
  if (!config[0]) {
    const inserted = await db.insert(botWhatsappConfigs).values({ botId }).returning();
    config = [inserted[0]];
  }
  return c.json(config[0]);
});

botsRoutes.patch('/:id/config/whatsapp', authMiddleware, async (c) => {
  const botId = c.req.param('id');
  const body = await c.req.json();
  const updated = await db.update(botWhatsappConfigs)
    .set({
      whatsappPhoneNumberId: body.whatsappPhoneNumberId,
      whatsappBusinessAccountId: body.whatsappBusinessAccountId,
      whatsappToken: body.whatsappToken,
      isActive: body.isActive,
      updatedAt: new Date()
    })
    .where(eq(botWhatsappConfigs.botId, botId))
    .returning();
    
});


// GENERAL CONFIG ROUTES (Master Toggles e IA)

botsRoutes.get('/:id/config', authMiddleware, async (c) => {
  const botId = c.req.param('id');
  
  let config = await db.select().from(botConfigs).where(eq(botConfigs.botId, botId)).limit(1);
  if (!config[0]) {
    const inserted = await db.insert(botConfigs).values({ botId }).returning();
    config = [inserted[0]];
  }
  return c.json(config[0]);
});

botsRoutes.patch('/:id/config', authMiddleware, async (c) => {
  const botId = c.req.param('id');
  const body = await c.req.json();
  const updated = await db.update(botConfigs)
    .set({
      botActive: body.botActive,
      automationEnabled: body.automationEnabled,
      aiEnabled: body.aiEnabled,
      intentionThreshold: body.intentionThreshold,
      defaultReplyMessage: body.defaultReplyMessage,
      updatedAt: new Date()
    })
    .where(eq(botConfigs.botId, botId))
    .returning();
    
  return c.json(updated[0]);
});

// ─── METRICS ──────────────────────────────────────────────────────────────────
// GET /api/bots/:botId/metrics/daily?date=2026-04-06
// Siempre aislado por botId. Fecha en UTC (YYYY-MM-DD). Por defecto hoy UTC.
botsRoutes.get('/:id/metrics/daily', authMiddleware, botMemberGuard, async (c) => {
  const botId = c.req.param('id');
  const dateParam = c.req.query('date'); // YYYY-MM-DD en UTC

  let targetDate: Date | undefined;
  if (dateParam) {
    // Forzar la interpretación en UTC aunque el string no tenga sufijo Z
    targetDate = new Date(`${dateParam}T00:00:00.000Z`);
    if (isNaN(targetDate.getTime())) {
      return c.json({ error: 'Formato de fecha inválido. Usa YYYY-MM-DD.' }, 400);
    }
  }

  const metrics = await getDailyMetrics(botId, targetDate);
  return c.json(metrics);
});

// ─── MEMBERS ──────────────────────────────────────────────────────────────────
// GET /api/bots/:id/members
botsRoutes.get('/:id/members', authMiddleware, botMemberGuard, async (c) => {
  const botId = c.req.param('id');
  const members = await db
    .select({
      id: botMembers.id,
      userId: botMembers.userId,
      role: botMembers.role,
      createdAt: botMembers.createdAt,
      email: users.email,
    })
    .from(botMembers)
    .innerJoin(users, eq(botMembers.userId, users.id))
    .where(eq(botMembers.botId, botId));

  return c.json(members);
});

// POST /api/bots/:id/members — invitar usuario por email con rol
botsRoutes.post('/:id/members', authMiddleware, botMemberGuard, async (c) => {
  const botId = c.req.param('id');
  const { email, role } = await c.req.json();

  if (!email || !role) return c.json({ error: 'email y role son requeridos' }, 400);

  const userRow = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!userRow[0]) return c.json({ error: 'Usuario no encontrado con ese email' }, 404);

  // Evitar duplicados
  const existing = await db
    .select({ id: botMembers.id })
    .from(botMembers)
    .where(eq(botMembers.botId, botId))
    .limit(1);

  // Check más específico por userId
  const allMembers = await db.select().from(botMembers).where(eq(botMembers.botId, botId));
  const isDuplicate = allMembers.some((m) => m.userId === userRow[0].id);
  if (isDuplicate) return c.json({ error: 'El usuario ya es miembro de este bot' }, 409);

  const inserted = await db
    .insert(botMembers)
    .values({ botId, userId: userRow[0].id, role })
    .returning();

  return c.json(inserted[0], 201);
});

// DELETE /api/bots/:id/members/:memberId
botsRoutes.delete('/:id/members/:memberId', authMiddleware, botMemberGuard, async (c) => {
  const memberId = c.req.param('memberId');

  // Evitar borrar el último admin
  const member = await db.select().from(botMembers).where(eq(botMembers.id, memberId)).limit(1);
  if (!member[0]) return c.json({ error: 'Miembro no encontrado' }, 404);

  if (member[0].role === 'CLIENT_ADMIN') {
    const botId = c.req.param('id');
    const admins = await db
      .select()
      .from(botMembers)
      .where(eq(botMembers.botId, botId));

    const adminCount = admins.filter((m) => m.role === 'CLIENT_ADMIN').length;
    if (adminCount <= 1) {
      return c.json({ error: 'No puedes eliminar al único admin del bot' }, 400);
    }
  }

  await db.delete(botMembers).where(eq(botMembers.id, memberId));
  return c.json({ success: true });
});

