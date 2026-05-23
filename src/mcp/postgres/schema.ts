import { z } from "zod";

const rowValue = z.any();

export const postgresQueryInputSchema = {
  sql: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "SQL tidak boleh kosong",
    })
    .refine((val) => val.length <= 100000, {
      message: "SQL terlalu panjang (maks. 100.000 karakter)",
    })
    .describe(
      "Satu pernyataan SQL. Tidak boleh beberapa pernyataan dipisah ';'."
    ),
} as const;

export const postgresQueryOutputShape = {
  kind: z.enum(["resultset", "execute"]),
  columns: z.array(z.string()).optional(),
  rowCount: z.number().int().nonnegative().optional(),
  totalRows: z.number().int().nonnegative().optional(),
  truncated: z.boolean().optional(),
  maxRows: z.number().int().positive().optional(),
  rows: z.array(z.record(z.string(), rowValue)).optional(),
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
    rows: z.array(z.record(z.string(), rowValue)),
  }),
  z.object({
    kind: z.literal("execute"),
    affectedRows: z.number().int().nonnegative(),
  }),
]);
