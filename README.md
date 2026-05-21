# mcp-postgres-ts

Server [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) untuk PostgreSQL. Tool `postgres_query` memungkinkan klien MCP (misalnya Cursor) menjalankan **satu** pernyataan SQL setiap kali dipanggil.

**Mode bawaan: hanya baca (read-only).** Perintah seperti `INSERT`, `UPDATE`, `DELETE`, dan DDL tidak dijalankan kecuali Anda mengaktifkan variabel lingkungan khusus (lihat di bawah).

## Persyaratan

- Node.js **≥ 20**

Komunikasi memakai **stdio** (bukan HTTP). Kredensial dan opsi PostgreSQL diatur lewat variabel lingkungan pada konfigurasi MCP (`env`) atau di sistem.

## Instalasi di Cursor

1. Buka **Settings → MCP**, atau edit file `mcp.json` untuk akun Cursor Anda.
2. Tambahkan entri server seperti contoh berikut.

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "mcp-postgres-ts"],
      "env": {
        "PGHOST": "127.0.0.1",
        "PGUSER": "postgres",
        "PGPASSWORD": "password",
        "PGDATABASE": "nama_db"
      }
    }
  }
}
```

Sesuaikan nilai `env` dengan server PostgreSQL Anda.

## Manual dari clone repository

```bash
git clone <url-repo> mcp-postgres-ts
cd mcp-postgres-ts
pnpm install && pnpm run build
```

Daftarkan server MCP dengan **`node`** dan path absolut ke `dist/index.js`:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": ["C:/Users/Username/proyek/mcp-postgres-ts/dist/index.js"],
      "env": {
        "PGHOST": "127.0.0.1",
        "PGUSER": "postgres",
        "PGPASSWORD": "password",
        "PGDATABASE": "nama_db"
      }
    }
  }
}
```

Ganti path di `args` sesuai lokasi clone. Setelah mengubah sumber TypeScript, jalankan lagi `pnpm run build`.

## Variabel lingkungan

### Koneksi (konvensi libpq)

| Variabel | Default | Keterangan |
|----------|---------|------------|
| `PGHOST` | `127.0.0.1` | Host PostgreSQL |
| `PGPORT` | `5432` | Port |
| `PGUSER` | `postgres` | Nama pengguna |
| `PGPASSWORD` | *(tidak diset = string kosong)* | Kata sandi |
| `PGDATABASE` | *(opsional)* | Nama database |
| `PG_MAX_ROWS` | `500` | Batas baris hasil yang ditampilkan (query yang mengembalikan baris) |

### Mengizinkan operasi tulis

Perintah **baca** (`SELECT`, `WITH`, `EXPLAIN`, `TABLE`, `VALUES`, dan pola read sejenis) selalu diperbolehkan.

Untuk **tulis** atau **DDL**, aktifkan variabel berikut. Nilai yang dianggap aktif: `true`, `1`, `yes`, atau `on` (tidak case-sensitive).

| Variabel | Mengizinkan |
|----------|-------------|
| `ALLOW_INSERT_OPERATION` | `INSERT` |
| `ALLOW_UPDATE_OPERATION` | `UPDATE` |
| `ALLOW_DELETE_OPERATION` | `DELETE` |
| `ALLOW_DDL_OPERATION` | DDL (`CREATE`, `ALTER`, `DROP`, dll.) |

Jika variabel tidak diset atau nilainya bukan salah satu di atas, jenis operasi itu **ditolak**.

## Perilaku lain

- Satu permintaan hanya boleh berisi **satu** pernyataan SQL (tidak boleh beberapa perintah dipisah `;`).
- Hasil query yang mengembalikan baris ditampilkan sebagai teks berkolom; jumlah baris dibatasi oleh `PG_MAX_ROWS`.
