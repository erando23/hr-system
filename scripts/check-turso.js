// scripts/check-turso.js
// Verifikasi koneksi ke Turso/libSQL + list tabel existing.
// Pakai: node scripts/check-turso.js

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("ERROR: DATABASE_URL dan DATABASE_AUTH_TOKEN harus di-set.");
  console.error("  $env:DATABASE_URL='libsql://...' ; $env:DATABASE_AUTH_TOKEN='...' ; node scripts/check-turso.js");
  process.exit(1);
}

if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
  console.error("ERROR: DATABASE_URL harus ber-prefix libsql:// atau https:// (Turso).");
  process.exit(1);
}

const client = createClient({ url, authToken });

try {
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const tables = result.rows.map((r) => r.name);

  console.log("Koneksi ke Turso: OK");
  console.log(`URL: ${url}`);
  console.log(`\nTabel yang ada (${tables.length}):`);
  if (tables.length === 0) {
    console.log("  (database kosong — aman untuk seed)");
  } else {
    for (const t of tables) console.log(`  - ${t}`);
  }
} catch (e) {
  console.error("Gagal query:", e.message);
  process.exit(1);
} finally {
  client.close();
}
