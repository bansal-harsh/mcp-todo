import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';
let dbInstance = null;
export function getDb() {
    if (dbInstance) {
        return dbInstance;
    }
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not set in environment variables.');
    }
    const client = neon(databaseUrl);
    dbInstance = drizzle(client, { schema });
    return dbInstance;
}
