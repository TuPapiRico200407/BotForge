import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/client';
import { bots, botMembers } from '../db/schema';
import { Role } from '@botforge/core';

export class BotRepository {
  async getBotsByUser(userId: string, role: string) {
    if (role === 'SUPER_ADMIN') {
      return await db.select().from(bots);
    }
    
    // For AGENT or CLIENT_ADMIN, get bots they are members of
    const memberships = await db.select({ botId: botMembers.botId })
      .from(botMembers)
      .where(eq(botMembers.userId, userId));
      
    if (memberships.length === 0) return [];
    
    const botIds = memberships.map(m => m.botId);
    return await db.select().from(bots).where(inArray(bots.id, botIds));
  }

  async createBot(name: string, ownerUserId: string) {
    return await db.transaction(async (tx) => {
      // 1. Create bot
      const newBot = await tx.insert(bots).values({
        name,
        status: 'active'
      }).returning();
      
      const bot = newBot[0];

      // 2. Assign membership to creator as CLIENT_ADMIN
      await tx.insert(botMembers).values({
        botId: bot.id,
        userId: ownerUserId,
        role: 'CLIENT_ADMIN'
      });

      return bot;
    });
  }
}
