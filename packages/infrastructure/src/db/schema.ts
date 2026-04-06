import { boolean, integer, jsonb, pgEnum, pgTable, real, text, timestamp, uuid, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['SUPER_ADMIN', 'CLIENT_ADMIN', 'AGENT']);
export const botStatusEnum = pgEnum('bot_status', ['active', 'inactive']);
export const conversationStatusEnum = pgEnum('conversation_status', ['open', 'closed', 'manual', 'pending_human']);
export const messageDirectionEnum = pgEnum('message_direction', ['incoming', 'outgoing']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'template', 'system', 'audio', 'image', 'document']);
export const transcriptionStatusEnum = pgEnum('transcription_status', ['pending', 'completed', 'failed']);
export const eventTypeEnum = pgEnum('event_type', ['intent_detected', 'auto_reply_sent', 'pending_human_triggered', 'manual_taken', 'automation_resumed', 'transcription_failed']);

// 1. Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  role: roleEnum('role').default('AGENT').notNull(),
  passwordHash: text('password_hash'), // Mock JWT auth field temporay
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Roles (Table version if dynamic roles are needed, but for MVP enum is enough. Defining standard requested entity)
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // 'SUPER_ADMIN', 'CLIENT_ADMIN', 'AGENT'
  description: text('description')
});

// 2. Bots
export const bots = pgTable('bots', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  status: botStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Bot Members
export const botMembers = pgTable('bot_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Contacts
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  phoneNumber: text('phone_number').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Conversations
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  contactId: uuid('contact_id').references(() => contacts.id).notNull(),
  status: conversationStatusEnum('status').default('open').notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  botCIdx: index('idx_conversations_bot_id').on(t.botId),
  contactCIdx: index('idx_conversations_contact_id').on(t.contactId)
}));

// 6. Messages
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
  direction: messageDirectionEnum('direction').notNull(),
  type: messageTypeEnum('type').default('text').notNull(),
  content: text('content'), // En audios, esto podría quedar nulo o guardar una mini fallback info.
  // Audios / Media fields
  storagePath: text('storage_path'), // Bucket path privado
  mediaType: text('media_type'), // audio/ogg
  transcriptionText: text('transcription_text'),
  transcriptionStatus: transcriptionStatusEnum('transcription_status'), // Enum seguro
  intentionDetected: text('intention_detected'),
  intentionConfidence: integer('intention_confidence'),
  // Generic Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
}, (t) => ({
  convMIdx: index('idx_messages_conversation_id').on(t.conversationId),
  botMIdx: index('idx_messages_bot_id').on(t.botId)
}));

// 7. Message Media
export const messageMedia = pgTable('message_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id').references(() => messages.id).notNull(),
  botId: uuid('bot_id').references(() => bots.id).notNull(), // added for security/isolation
  storageUrl: text('storage_url').notNull(),
  mimeType: text('mime_type').notNull(),
  fileName: text('file_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Keyword Rules
export const keywordMatchEnum = pgEnum('match_type', ['exact', 'includes']);

export const keywordRules = pgTable('keyword_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  keyword: text('keyword').notNull(), // Or "intention" keyword for future Audio processing
  matchType: keywordMatchEnum('match_type').default('includes').notNull(),
  response: text('response').notNull(),
  linkUrl: text('link_url'), // Link adjunto si aplica
  templateId: text('template_id'), // ID futuro de plantilla Meta
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. External Links
export const externalLinks = pgTable('external_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Message Templates
export const messageTemplates = pgTable('message_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  name: text('name').notNull(),
  content: text('content').notNull(), // Template string supporting variables
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Bot AI Settings
export const botAISettings = pgTable('bot_ai_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull().unique(),
  enabled: boolean('enabled').default(false).notNull(),
  provider: text('provider').default('cerebras'),
  systemPrompt: text('system_prompt'),
  confidenceThreshold: real('confidence_threshold').default(0.7),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 12. Bot WhatsApp Configs
export const botWhatsappConfigs = pgTable('bot_whatsapp_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull().unique(),
  whatsappPhoneNumberId: text('wa_phone_number_id'),
  whatsappBusinessAccountId: text('wa_business_account_id'),
  whatsappToken: text('wa_token'),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Bot Configs
export const botConfigs = pgTable('bot_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull().unique(),
  botActive: boolean('bot_active').default(true).notNull(),
  automationEnabled: boolean('automation_enabled').default(false).notNull(),
  aiEnabled: boolean('ai_enabled').default(false).notNull(),
  defaultReplyMessage: text('default_reply_message'),
  intentionThreshold: integer('intention_threshold').default(75).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 14. Message Transcriptions
export const messageTranscriptions = pgTable('message_transcriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id').references(() => messages.id).notNull().unique(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  transcriptionText: text('transcription_text').notNull(),
  detectedIntention: text('detected_intention'),
  confidenceScore: real('confidence_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Handoff Events
export const handoffEvents = pgTable('handoff_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  reason: text('reason').notNull(), // e.g. "low_confidence", "media_received", "manual_request"
  status: text('status').default('pending_human'), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// 16. Daily Bot Metrics
export const dailyBotMetrics = pgTable('daily_bot_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  // Fecha truncada a día en UTC — siempre 00:00:00Z para evitar ambigüedad de zona horaria
  date: timestamp('date', { withTimezone: false }).notNull(),
  incomingMessagesCount: integer('incoming_messages_count').default(0).notNull(),
  outgoingMessagesCount: integer('outgoing_messages_count').default(0).notNull(),
  handoffsCount: integer('handoffs_count').default(0).notNull(),
  aiRepliesCount: integer('ai_replies_count').default(0).notNull(),
  pendingHumanCount: integer('pending_human_count').default(0).notNull(),
}, (t) => ({
  // Constraint único para upserts idempotentes por día UTC
  uniqBotDay: unique('uq_bot_metrics_day').on(t.botId, t.date),
  botMetricsIdx: index('idx_bot_metrics_bot_id').on(t.botId),
}));

// 17. Conversation Events (Audit Log Hibrido)
export const conversationEvents = pgTable('conversation_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  botId: uuid('bot_id').references(() => bots.id).notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
  eventType: eventTypeEnum('event_type').notNull(),
  eventLabel: text('event_label'),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  convEIdx: index('idx_events_conversation_id').on(t.conversationId),
  botEIdx: index('idx_events_bot_id').on(t.botId)
}));

// Base Relations Exporter (for Drizzle relational queries)
export const botRelations = relations(bots, ({ many, one }) => ({
  members: many(botMembers),
  conversations: many(conversations),
  messages: many(messages),
  aiSettings: one(botAISettings, { fields: [bots.id], references: [botAISettings.botId] }),
  whatsappConfig: one(botWhatsappConfigs, { fields: [bots.id], references: [botWhatsappConfigs.botId] }),
  config: one(botConfigs, { fields: [bots.id], references: [botConfigs.botId] }),
}));

export const userRelations = relations(users, ({ many }) => ({
  botMemberships: many(botMembers),
}));

export const botMemberRelations = relations(botMembers, ({ one }) => ({
  bot: one(bots, { fields: [botMembers.botId], references: [bots.id] }),
  user: one(users, { fields: [botMembers.userId], references: [users.id] }),
}));
