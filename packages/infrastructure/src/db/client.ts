import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Conexión genérica 
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/botforge';

// Keep connection alive or instantiate. For Edge (Cloudflare/Supabase functions), postgres.js is highly capable.
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
