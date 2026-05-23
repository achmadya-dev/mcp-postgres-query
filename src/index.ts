#!/usr/bin/env node
import { Server } from "./mcp/server.js";
import packageJson from "../package.json" with { type: "json" };
import {
  postgres_select,
  postgres_insert,
  postgres_update,
  postgres_delete,
  postgres_ddl,
} from "./mcp/registry.js";

async function main(): Promise<void> {
  const server = new Server({
    name: "PostgreSQL Database",
    version: packageJson.version,
  });

  server.registerTool(postgres_select);
  server.registerTool(postgres_insert);
  server.registerTool(postgres_update);
  server.registerTool(postgres_delete);
  server.registerTool(postgres_ddl);

  await server.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
