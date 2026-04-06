import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db/client';
import { messages } from '../db/schema';
import { MessageType, MessageDirection } from '@botforge/core';

export class MessageRepository {
  async createMessage(data: { conversationId: string, botId: string, direction: MessageDirection, type: MessageType, content: string }) {
    const created = await db.insert(messages)
      .values(data)
      .returning();
    return created[0];
  }

  async getMessagesByConversation(conversationId: string, botId: string) {
    return await db.select()
      .from(messages)
      .where(and(eq(messages.conversationId, conversationId), eq(messages.botId, botId)))
      .orderBy(asc(messages.createdAt)); // Orden cronológico arriba a abajo
  }
}
