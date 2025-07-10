import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/indian_cuisine_db';

// Create the connection
const queryClient = postgres(connectionString);

// Create the drizzle database instance
export const db = drizzle(queryClient, { schema });

export { queryClient };
