import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { config } from "./config";

const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Export pool for health checks
export { pool };
