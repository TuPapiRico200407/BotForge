import { Hono } from 'hono';
import { 
  ContactRepository, ConversationRepository, MessageRepository, 
  WhatsAppProvider, AutoReplyService, SupabaseStorageProvider, 
  OpenAIWhisperProvider, CerebrasIntentionProvider,
  db, botWhatsappConfigs, botConfigs, keywordRules, conversationEvents 
} from '@botforge/infrastructure';
import { eq } from 'drizzle-orm';

export const webhooksRoutes = new Hono();

const contactRepo = new ContactRepository();
const convRepo = new ConversationRepository();
const msgRepo = new MessageRepository();
const autoReply = new AutoReplyService();
const waProvider = new WhatsAppProvider();
const storage = new SupabaseStorageProvider();
const whisper = new OpenAIWhisperProvider();
const cerebras = new CerebrasIntentionProvider();

// GET /api/webhooks/whatsapp (Validación Challenge)
webhooksRoutes.get('/whatsapp', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'test_botforge_sprint02';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhook] Validado exitosamente');
    return c.text(challenge || '');
  }
  return c.text('Forbidden', 403);
});

// POST /api/webhooks/whatsapp (Eventos / Mensajes entrantes)
webhooksRoutes.post('/whatsapp', async (c) => {
  // META requiere que aceptemos con 200 OK urgente.
  const payload = await c.req.json().catch(() => null);
  if (!payload || !payload.entry) return c.text('OK');

  // Procesamos en background (Worker pattern o sync rápido)
  try {
    const entry = payload.entry[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    
    if (value && value.messages?.length > 0) {
      const message = value.messages[0];
      const phoneNumberId = value.metadata.phone_number_id; // Clave para aislar bot
      const contactPhone = value.contacts?.[0]?.wa_id;
      const contactName = value.contacts?.[0]?.profile?.name;

      if (message.type === 'text' || message.type === 'audio') {
        const textBody = message.type === 'text' ? message.text.body : '';
        const isAudio = message.type === 'audio';

          // 1. Resolver Bot dueño
          const configRecord = await db.select().from(botWhatsappConfigs)
            .where(eq(botWhatsappConfigs.whatsappPhoneNumberId, phoneNumberId)).limit(1);

          if (configRecord[0] && configRecord[0].isActive) {
            const botId = configRecord[0].botId;

            // Recuperar estados maestros
            const botConf = await db.select().from(botConfigs).where(eq(botConfigs.botId, botId)).limit(1);
            const isBotActive = botConf[0]?.botActive ?? true;
            const isAutomationEnabled = botConf[0]?.automationEnabled ?? false;
            const isAiEnabled = botConf[0]?.aiEnabled ?? false;
            const configThreshold = botConf[0]?.intentionThreshold ?? 75;

            // 2. Transacción de Dominio Basal
          const contact = await contactRepo.upsertContact(botId, contactPhone, contactName);
          const conversation = await convRepo.upsertConversation(botId, contact.id);
          
          let persistData: any = {
            botId,
            conversationId: conversation.id,
            direction: 'incoming',
            type: isAudio ? 'audio' : 'text',
            content: textBody || "Nota de voz recibida",
          };

            // AUDIO PIPELINE (Sensible a aiEnabled)
            let finalTranscription = '';
            let derivedIntent = 'unknown';

            if (isAudio && message.audio?.id) {
              try {
                console.log(`[Webhook] Descargando audio ${message.audio.id}...`);
                const media = await waProvider.downloadMedia(message.audio.id, configRecord[0].whatsappToken!);
                
                const filename = `${botId}/${conversation.id}/${Date.now()}.ogg`;
                const storagePath = await storage.uploadFile(media.buffer, filename, media.mimeType);
                
                persistData.storagePath = storagePath;
                persistData.mediaType = media.mimeType;

                // Solo si la IA esta encendida, operamos la magia
                if (isBotActive && isAiEnabled) {
                  console.log(`[Webhook] Transcribiendo audio...`);
                  finalTranscription = await whisper.transcribe(media.buffer, 'audio.ogg');
                  persistData.transcriptionText = finalTranscription;
                  persistData.transcriptionStatus = 'completed';

                  console.log(`[Webhook] Analizando Intenciones en Transcripción...`);
                  const rules = await db.select().from(keywordRules).where(eq(keywordRules.botId, botId));
                  const validKeywords = rules.filter(r => r.isActive).map(r => r.keyword);

                  const intentRes = await cerebras.classifyIntent(finalTranscription, validKeywords);
                  derivedIntent = intentRes.intent;
                  persistData.intentionDetected = intentRes.intent;
                  persistData.intentionConfidence = intentRes.confidence;

                  // Loguear evento de intencion pura
                  await db.insert(conversationEvents).values({
                     botId, conversationId: conversation.id,
                     eventType: 'intent_detected',
                     eventLabel: `Intención: ${intentRes.intent}`,
                     payload: { intent: intentRes.intent, confidence: intentRes.confidence }
                  });

                  if (intentRes.intent === 'unknown' || intentRes.confidence < configThreshold) {
                     console.log(`[Webhook] Intención desconocida o baja confianza (< ${configThreshold}). Derivando a pending_human.`);
                     const conversationsTb = require('@botforge/infrastructure').conversations;
                     await db.update(conversationsTb).set({ status: 'pending_human' }).where(eq(conversationsTb.id, conversation.id));
                     conversation.status = 'pending_human';
                     
                     await db.insert(conversationEvents).values({
                         botId, conversationId: conversation.id,
                         eventType: 'pending_human_triggered',
                         eventLabel: `Derivación IA por confianza baja (${intentRes.confidence}%)`,
                         payload: { reason: "low_confidence", detected: intentRes.intent, score: intentRes.confidence }
                     });
                  }
                }
              } catch (err) {
                console.error("[Webhook Audio Pipeline Error]", err);
                persistData.transcriptionStatus = 'failed';
                
                await db.insert(conversationEvents).values({
                   botId, conversationId: conversation.id, eventType: 'transcription_failed', eventLabel: 'Fallo al procesar motor de voz'
                });
              }
            }

            // Guardar el mensaje entrante
            await msgRepo.createMessage(persistData);

            if (!isBotActive) {
               console.log(`[Webhook] Bot Apagado operativamente. Solo registrado.`);
               return c.text('OK', 200);
            }

            // 3. Verificamos control manual
            if (conversation.status === 'manual' || conversation.status === 'pending_human') {
              console.log(`[Webhook] Conversacion frenada (status: ${conversation.status}).`);
              return c.text('OK', 200);
            }

            // 4. Mecanismo de Respuesta Automática
            if (isAutomationEnabled) {
              const targetScanText = (isAudio && isAiEnabled) ? derivedIntent : textBody;
              
              const rule = await autoReply.process(botId, targetScanText);
            
            if (rule) {
               console.log(`[Webhook] Regla disparada ('${rule.keyword}') -> Respuesta configurada`);
               
               const finalText = rule.linkUrl ? `${rule.response}\n\nEnlace: ${rule.linkUrl}` : rule.response;
               
               try {
                 await waProvider.sendTextMessage(
                    configRecord[0].whatsappPhoneNumberId!,
                    configRecord[0].whatsappToken!,
                    contactPhone,
                    finalText
                 );
                 
                 await msgRepo.createMessage({
                    botId,
                    conversationId: conversation.id,
                    direction: 'outgoing',
                    type: 'system',
                    content: finalText
                 });
                 
                 await db.insert(conversationEvents).values({
                    botId, conversationId: conversation.id,
                    eventType: 'auto_reply_sent',
                    eventLabel: `Regla Automática: "${rule.keyword}"`
                 });
               } catch (waErr) {
                 console.error("[Webhook WA Sending Error]", waErr);
               }
            } else if (isAudio && isAiEnabled) {
               // Si era un intento valido pero NO HABIA REGLA CONFIGURADA
               // Ruteo a pendiente humano por falta de training
               const conversationsTb = require('@botforge/infrastructure').conversations;
               await db.update(conversationsTb).set({ status: 'pending_human' }).where(eq(conversationsTb.id, conversation.id));
               await db.insert(conversationEvents).values({
                   botId, conversationId: conversation.id,
                   eventType: 'pending_human_triggered',
                   eventLabel: `No se encontró respuesta para intención (${derivedIntent})`
               });
            }
          }
          
          console.log(`[Webhook] Mensaje entrante parseado para el Bot: ${botId}`);
        } else {
           console.log(`[Webhook] Mensaje ignorado, número destino no está en la BD o inactivo: ${phoneNumberId}`);
        }
      }
    }
  } catch (err) {
    console.error("[Webhook Error] No fatal para ack:", err);
  }

  // Respuesta OBLIGATORIA inmediata, sin frenar si da error.
  return c.text('OK', 200);
});
