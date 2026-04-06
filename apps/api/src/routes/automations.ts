import { Hono } from 'hono';
import { db, keywordRules, botConfigs, bots } from '@botforge/infrastructure';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middlewares/auth';

export const automationsRoutes = new Hono();

automationsRoutes.use('*', authMiddleware);

// Config Bot Automations / Toggles
automationsRoutes.get('/bots/:botId/config', async (c) => {
  const botId = c.req.param('botId');
  
  let bot = await db.select().from(bots).where(eq(bots.id, botId)).limit(1);
  let config = await db.select().from(botConfigs).where(eq(botConfigs.botId, botId)).limit(1);
  
  if (!config[0]) {
    const inserted = await db.insert(botConfigs).values({ botId }).returning();
    config = [inserted[0]];
  }

  return c.json({
     bot_active: bot[0]?.status === 'active',
     automationEnabled: config[0].automationEnabled,
     // aiEnabled: TODO sprint 05 config
  });
});

automationsRoutes.patch('/bots/:botId/config', async (c) => {
  const botId = c.req.param('botId');
  const body = await c.req.json();
  
  if (typeof body.bot_active === 'boolean') {
     await db.update(bots).set({ status: body.bot_active ? 'active' : 'inactive' }).where(eq(bots.id, botId));
  }
  
  const updated = await db.update(botConfigs)
    .set({ automationEnabled: body.automationEnabled, updatedAt: new Date() })
    .where(eq(botConfigs.botId, botId))
    .returning();
    
  return c.json(updated[0]);
});

// Keywords CRUD
automationsRoutes.get('/bots/:botId/automations/keywords', async (c) => {
  const botId = c.req.param('botId');
  const rules = await db.select().from(keywordRules).where(eq(keywordRules.botId, botId));
  return c.json(rules);
});

automationsRoutes.post('/bots/:botId/automations/keywords', async (c) => {
  const botId = c.req.param('botId');
  const body = await c.req.json();
  
  const newRule = await db.insert(keywordRules).values({
    botId,
    keyword: body.keyword,
    matchType: body.matchType || 'includes',
    response: body.response,
    linkUrl: body.linkUrl,
  }).returning();
  
  return c.json(newRule[0], 201);
});

automationsRoutes.delete('/bots/:botId/automations/keywords/:ruleId', async (c) => {
  const ruleId = c.req.param('ruleId');
  await db.delete(keywordRules).where(eq(keywordRules.id, ruleId));
  return c.json({ success: true });
});
