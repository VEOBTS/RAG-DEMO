import { Pool } from "pg";
 
declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}
 
// Reuse the pool across hot reloads in dev so we don't open hundreds of connections
export const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
 
if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}
 
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}