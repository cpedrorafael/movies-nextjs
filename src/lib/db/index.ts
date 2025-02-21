import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'movies.db');

const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite);

// Export all tables
export * from './schema';
