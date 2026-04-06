import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../db/client';
import { conversations, contacts, messages } from '../db/schema';

export class ConversationRepository {
  async upsertConversation(botId: string, contactId: string) {
    const existing = await db.select().from(conversations).where(
      and(eq(conversations.botId, botId), eq(conversations.contactId, contactId))
    ).limit(1);

    if (existing[0]) {
      // Refresh lastMessageAt
      const updated = await db.update(conversations)
        .set({ lastMessageAt: new Date(), status: existing[0].status === 'closed' ? 'open' : existing[0].status })
        .where(eq(conversations.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const created = await db.insert(conversations)
      .values({ botId, contactId })
      .returning();
    return created[0];
  }

  async getConversationsByBot(
    botId: string,
    filters?: {
      status?: string[];    // e.g. ['open', 'pending_human']
      messageType?: string; // e.g. 'audio'
    }
  ) {
    // Base query — siempre filtrado por botId (nunca cruza bots)
    let query = db
      .select({
        id: conversations.id,
        status: conversations.status,
        lastMessageAt: conversations.lastMessageAt,
        contact: {
          id: contacts.id,
          phoneNumber: contacts.phoneNumber,
          name: contacts.name,
        },
      })
      .from(conversations)
      .innerJoin(contacts, eq(conversations.contactId, contacts.id))
      .$dynamic();

    // Siempre aislar por bot
    const conditions: any[] = [eq(conversations.botId, botId)];

    if (filters?.status && filters.status.length > 0) {
      conditions.push(inArray(conversations.status, filters.status as any[]));
    }

    query = query.where(and(...conditions)).orderBy(desc(conversations.lastMessageAt));

    const result = await query;

    // Filtro por tipo de mensaje: requiere sub-query en messages
    if (filters?.messageType) {
      const convIds = result.map((r) => r.id);
      if (convIds.length === 0) return [];

      const matchingConvs = await db
        .selectDistinct({ conversationId: messages.conversationId })
        .from(messages)
        .where(
          and(
            inArray(messages.conversationId, convIds),
            eq(messages.type, filters.messageType as any),
          )
        );

      const matchingIds = new Set(matchingConvs.map((m) => m.conversationId));
      return result.filter((r) => matchingIds.has(r.id));
    }

    return result;
  }
}
