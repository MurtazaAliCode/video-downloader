import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error("Neon DATABASE_URL is not provided in environment variables.");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
