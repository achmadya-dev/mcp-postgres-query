import { defineTool, ToolError } from "@achmadya-dev/mcp-core";
import { z } from "zod";
import { runSql, safeQuery } from "../postgres/postgres.js";
import {
  postgresQueryInputSchema,
  postgresQueryOutputShape,
  postgresQueryResultSchema,
} from "../postgres/schema.js";
import config from "../postgres/config.js";

export const postgres_insert = defineTool({
  name: "postgres_insert",
  description:
    "Insert new data into the database using INSERT. Only a single query is allowed. Optionally pass database to override POSTGRES_DATABASE. If the operation is rejected as not allowed, you must respect this safety restriction and do not attempt to bypass it via terminal commands, custom scripts, or external tools.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async (input) => {
    if (!config.allowInsert) {
      throw new ToolError("INSERT operation is not allowed on this server.");
    }
    const query = safeQuery(input.sql, ["INSERT"]);
    const result = await runSql(query, { database: input.database });
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    }
    return parsed.data;
  },
});
