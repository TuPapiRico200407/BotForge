import { Hono } from 'hono';
import { ConversationRepository, MessageRepository, WhatsAppProvider, db, botWhatsappConfigs } from '@botforge/infrastructure';
import { authMiddleware } from '../middlewares/auth';
import { eq } from 'drizzle-orm';

export const inboxRoutes = new Hono();
const convRepo = new ConversationRepository();
const msgRepo = new MessageRepository();
const waProvider = new WhatsAppProvider();

// Aplicar auth
inboxRoutes.use('*', authMiddleware);

inboxRoutes.get('/bots/:botId/conversations', async (c) => {
  const botId = c.req.param('botId');

  // Filtros opcionales desde query params (siempre aislados por botId)
  const statusParam = c.req.query('status');  // e.g. "open,pending_human"
  const messageType = c.req.query('messageType'); // e.g. "audio"

  const statusFilter = statusParam
    ? statusParam.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  const list = await convRepo.getConversationsByBot(botId, {
    status: statusFilter,
    messageType: messageType || undefined,
  });
  return c.json(list);
});

inboxRoutes.get('/conversations/:convId/messages', async (c) => {
  const convId = c.req.param('convId');
  const botId = c.req.query('botId') || ''; // Idealmente se valida cross jwt 
  
  if (!botId) return c.json({ error: "botId query required" }, 400);

  const msgs = await msgRepo.getMessagesByConversation(convId, botId);
  return c.json(msgs);
});

// Feed Híbrido: Mensajes + Eventos mezclados para la UI (Timeline)
inboxRoutes.get('/conversations/:convId/feed', async (c) => {
  const convId = c.req.param('convId');
  const botId = c.req.query('botId') || ''; 
  if (!botId) return c.json({ error: "botId query required" }, 400);

  const msgs = await msgRepo.getMessagesByConversation(convId, botId);
  
  const conversationEvents = require('@botforge/infrastructure').conversationEvents;
  const events = await db.select().from(conversationEvents)
    .where(eq(conversationEvents.conversationId, convId));

  // O lo ordenamos en back o en front. Ya que `createdAt` viene en ambos, los fusionamos en back.
  const merged = [
    ...msgs.map(m => ({ ...m, _type: 'message' })), 
    ...events.map(e => ({ ...e, _type: 'event' }))
  ].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return c.json({ data: merged });
});

inboxRoutes.post('/conversations/:convId/messages', async (c) => {
  const convId = c.req.param('convId');
  const body = await c.req.json();
  const { botId, content, toPhone } = body;

  try {
    // 1. Recuperar Config WA del Bot para Tokens Reales
    const config = await db.select().from(botWhatsappConfigs).where(eq(botWhatsappConfigs.botId, botId)).limit(1);
    const waParams = config[0];

    if (!waParams || !waParams.whatsappToken || !waParams.whatsappPhoneNumberId) {
       return c.json({ error: "Las credenciales de WhatsApp Meta no están configuradas para este Bot." }, 400);
    }

    // 2. Disparar API Real de Meta
    await waProvider.sendTextMessage(
      waParams.whatsappPhoneNumberId, 
      waParams.whatsappToken, 
      toPhone, 
      content
    );

    // 3. Persistir si tuvo éxito 
    const saved = await msgRepo.createMessage({
      botId,
      conversationId: convId,
      direction: 'outgoing',
      type: 'text',
      content: content
    });

    // 4. Pasar a 'manual' para suspender el bot
    const conversations = require('@botforge/infrastructure').conversations;
    await db.update(conversations).set({ status: 'manual' }).where(eq(conversations.id, convId));

    return c.json(saved, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Error en Provider de WA' }, 500);
  }
});

// Update conversation status to resume auto-bots or suspend manually
inboxRoutes.patch('/conversations/:convId/status', async (c) => {
  const convId = c.req.param('convId');
  const body = await c.req.json();
  const conversationsTb = require('@botforge/infrastructure').conversations;
  const conversationEventsTb = require('@botforge/infrastructure').conversationEvents;

  const targetStatus = body.status;

  const updated = await db.update(conversationsTb)
    .set({ status: targetStatus })
    .where(eq(conversationsTb.id, convId))
    .returning();

  // Traer el botId actual
  if (updated[0]) {
      const type = targetStatus === 'manual' ? 'manual_taken' : 
                   (targetStatus === 'open' ? 'automation_resumed' : 'status_changed');
                   
      await db.insert(conversationEventsTb).values({
          botId: updated[0].botId,
          conversationId: convId,
          eventType: type,
          eventLabel: `Conversación transicionada a ${targetStatus}`
      });
  }
    
  return c.json(updated[0]);
});
// Proxy Protegido para Media Assets de UI (usados en la etiqueta <audio>)
inboxRoutes.get('/media/proxy', async (c) => {
  const path = c.req.query('path');
  const token = c.req.query('token'); 
  
  if (!path) return c.json({ error: 'path required' }, 400);

  // 1. Validar token manualmente ya que no viaja por Header (CORS de elements crudos)
  if (token) {
     try {
       // La librería jsonwebtoken o jose debería usarse aquí, pero esto es MVP y mock JWT.
       // Haremos una validación base.
       if (token === 'null' || !token) return c.text('Unauthorized', 401);
       // Decodificación / Verificación ...
     } catch (err) {
       return c.text('Invalid Token', 401);
     }
  }

  const { SupabaseStorageProvider } = require('@botforge/infrastructure');
  const storage = new SupabaseStorageProvider();

  const url = await storage.getSignedUrl(path, 3600);
  if (!url) return c.text('Not found', 404);
  
  return c.redirect(url);
});
