import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';

export class UserRepository {
  async findByEmail(email: string) {
    const records = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return records[0] || null;
  }
}
