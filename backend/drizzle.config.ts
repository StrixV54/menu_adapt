import type { Config } from 'drizzle-kit';

export default {
  schema: './config/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/indian_cuisine_db',
  },
} satisfies Config;
