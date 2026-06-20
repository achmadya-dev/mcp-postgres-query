#!/usr/bin/env node
import { runMcp } from "@achmadya-dev/mcp-core";
import packageJson from "../package.json" with { type: "json" };
import { postgres_ddl } from "./tools/postgres_ddl.js";
import { postgres_delete } from "./tools/postgres_delete.js";
import { postgres_insert } from "./tools/postgres_insert.js";
import { postgres_select } from "./tools/postgres_select.js";
import { postgres_update } from "./tools/postgres_update.js";

await runMcp({
  name: "PostgreSQL Database",
  version: packageJson.version,
  transport: "stdio",
  tools: [postgres_select, postgres_insert, postgres_update, postgres_delete, postgres_ddl],
});
