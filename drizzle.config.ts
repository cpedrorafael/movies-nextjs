import type { Config } from 'drizzle-kit';
import { join } from 'path';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: join(process.cwd(), './src/lib/db/movies.db'),
  },
} satisfies Config;
