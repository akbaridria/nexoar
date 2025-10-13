import { neon } from "@neondatabase/serverless";
import type { Logger as drizzleLogger } from "drizzle-orm/logger";
import { drizzle } from "drizzle-orm/neon-http";
import { logger } from "../lib/logger.js";
import type { userHistory } from "./schema/schema.js";
import * as schema from './schema/schema.js';

class DBLogger implements drizzleLogger {
  logQuery(query: string, params: unknown[]): void {
    logger.debug({ query, params });
  }
}

export type User = typeof userHistory.$inferSelect;
export type NewUser = typeof userHistory.$inferInsert;

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, logger: new DBLogger(), schema: schema });

export { db };
