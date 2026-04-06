import { db } from './client';
import { users } from './schema';
import crypto from 'crypto';

async function seed() {
  console.log('Running robust seed for Sprint 01...');
  
  // Basic mock hashing for sprint 01 JWT until Supabase integration
  const hasher = (pwd: string) => crypto.createHash('sha256').update(pwd).digest('hex');

  // Upsert super admin
  await db.insert(users).values({
    email: 'admin@botforge.com',
    role: 'SUPER_ADMIN',
    passwordHash: hasher('123456') // Only for Sprint 01 demo!
  }).onConflictDoNothing({ target: users.email });

  console.log('Seeded SUPER_ADMIN: admin@botforge.com / 123456');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
