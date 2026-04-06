import { createMiddleware } from 'hono/factory';
import { db, botMembers } from '@botforge/infrastructure';
import { and, eq } from 'drizzle-orm';

/**
 * Guard de membresía por bot.
 * Debe usarse DESPUÉS del authMiddleware.
 * Extrae jwtPayload.sub y el param :botId para validar en bot_members.
 * SUPER_ADMIN lo puede ver todo.
 */
export const botMemberGuard = createMiddleware(async (c, next) => {
  const payload = c.get('jwtPayload') as any;
  const botId = c.req.param('botId') || c.req.param('id');

  if (!botId) return next(); // rutas sin botId (ej. listado general)

  // SUPER_ADMIN bypass — puede ver todos los bots
  if (payload?.role === 'SUPER_ADMIN') return next();

  const userId = payload?.sub || payload?.id;
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const membership = await db
    .select({ id: botMembers.id })
    .from(botMembers)
    .where(and(eq(botMembers.botId, botId), eq(botMembers.userId, userId)))
    .limit(1);

  if (!membership[0]) {
    return c.json({ error: 'Forbidden: no tienes acceso a este bot' }, 403);
  }

  return next();
});
