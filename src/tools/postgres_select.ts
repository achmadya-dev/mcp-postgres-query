import { defineTool, ToolError } from "@achmadya-dev/mcp-core";
import { z } from "zod";
import { runSql, safeQuery } from "../postgres/postgres.js";
import {
  postgresQueryInputSchema,
  postgresQueryOutputShape,
  postgresQueryResultSchema,
} from "../postgres/schema.js";

export const postgres_select = defineTool({
  name: "postgres_select",
  description:
    "Read data from the database using SELECT, EXPLAIN, TABLE, VALUES, or SHOW. Only a single query is allowed. Optionally pass database to override POSTGRES_DATABASE. Use z.table in SQL for other schemas within the same database.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async (input) => {
    const query = safeQuery(input.sql, ["SELECT", "EXPLAIN", "TABLE", "VALUES", "SHOW"]);
    const result = await runSql(query, { database: input.database });
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    }
    return parsed.data;
  },
});
