import { z } from "zod";

export const postgresQueryInputSchema = {
  sql: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "SQL cannot be empty",
    })
    .refine((val) => val.length <= 100000, {
      message: "SQL is too long (max 100,000 characters)",
    })
    .describe(
      "A single SQL statement. Multiple statements separated by ';' are not allowed."
    ),
  database: z
    .string()
    .optional()
    .describe(
      "Optional database name for this query. Overrides POSTGRES_DATABASE from server config. Schemas within a database are accessed via schema.table in SQL."
    ),
} as const;

export const postgresQueryOutputShape = {
  kind: z.enum(["resultset", "execute"]),
  columns: z.array(z.string()).optional(),
  rowCount: z.number().int().nonnegative().optional(),
  totalRows: z.number().int().nonnegative().optional(),
  truncated: z.boolean().optional(),
  maxRows: z.number().int().positive().optional(),
  rows: z.array(z.record(z.string(), z.any())).optional(),
  affectedRows: z.number().int().nonnegative().optional(),
} as const;

export const postgresQueryResultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("resultset"),
    columns: z.array(z.string()),
    rowCount: z.number().int().nonnegative(),
    totalRows: z.number().int().nonnegative(),
    truncated: z.boolean(),
    maxRows: z.number().int().positive(),
    rows: z.array(z.record(z.string(), z.any())),
  }),
  z.object({
    kind: z.literal("execute"),
    affectedRows: z.number().int().nonnegative(),
  }),
]);
