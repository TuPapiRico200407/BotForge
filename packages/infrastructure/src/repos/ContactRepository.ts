import { eq, and } from 'drizzle-orm';
import { db } from '../db/client';
import { contacts } from '../db/schema';

export class ContactRepository {
  async upsertContact(botId: string, phoneNumber: string, name?: string) {
    const existing = await db.select().from(contacts).where(
      and(eq(contacts.botId, botId), eq(contacts.phoneNumber, phoneNumber))
    ).limit(1);

    if (existing[0]) {
      if (name && existing[0].name !== name) {
         await db.update(contacts).set({ name }).where(eq(contacts.id, existing[0].id));
      }
      return existing[0];
    }

    const created = await db.insert(contacts)
      .values({ botId, phoneNumber, name })
      .returning();
    return created[0];
  }
}
