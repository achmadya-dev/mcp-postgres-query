import pg from "pg";
import type { Client } from "pg";
import type { PostgresConfig } from "../types.js";

export async function createClient(config: PostgresConfig): Promise<Client> {
  const client = new pg.Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });
  await client.connect();
  return client;
}
