import { defineTool, ToolError } from "./server.js";
import { runSql, safeQuery } from "./postgres/postgres.js";
import {
  postgresQueryInputSchema,
  postgresQueryOutputShape,
  postgresQueryResultSchema,
} from "./postgres/schema.js";

export const postgres_select = defineTool({
  name: "postgres_select",
  description: "Membaca data dari database menggunakan SELECT, EXPLAIN, TABLE, VALUES, atau SHOW. Hanya diizinkan satu kueri saja.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["SELECT", "EXPLAIN", "TABLE", "VALUES", "SHOW"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    }
    return parsed.data;
  },
});

export const postgres_insert = defineTool({
  name: "postgres_insert",
  description: "Memasukkan data baru ke database menggunakan INSERT. Hanya diizinkan satu kueri saja.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["INSERT"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const postgres_update = defineTool({
  name: "postgres_update",
  description: "Mengubah data yang ada di database menggunakan UPDATE. Hanya diizinkan satu kueri saja.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["UPDATE"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const postgres_delete = defineTool({
  name: "postgres_delete",
  description: "Menghapus data dari database menggunakan DELETE. Hanya diizinkan satu kueri saja.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["DELETE"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const postgres_ddl = defineTool({
  name: "postgres_ddl",
  description: "Mengubah skema database atau hak akses menggunakan CREATE, ALTER, DROP, TRUNCATE, RENAME, GRANT, REVOKE, atau COMMENT. Hanya diizinkan satu kueri saja.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME", "GRANT", "REVOKE", "COMMENT"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});
