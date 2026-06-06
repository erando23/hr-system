// scripts/migrate-turso-schema-sync.js
// Push schema additions to Turso (idempotent — safe to re-run).
// Run:  node scripts/migrate-turso-schema-sync.js
// Requires DATABASE_URL (libsql://...) and DATABASE_AUTH_TOKEN in .env or env.

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

// Minimal .env loader — no extra dep. Reads KEY=VALUE lines into process.env.
function loadEnvFile(filename) {
  const p = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
// Local dev: .env.local; Vercel CLI: .env.production.local; generic: .env
loadEnvFile(".env.local");
loadEnvFile(".env.production.local");
loadEnvFile(".env");

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !url.startsWith("libsql")) {
  console.error("ERROR: DATABASE_URL must be set and start with 'libsql://'");
  process.exit(1);
}
if (!authToken) {
  console.error("ERROR: DATABASE_AUTH_TOKEN must be set");
  process.exit(1);
}

const client = createClient({ url, authToken });

// Migrations are idempotent (IF NOT EXISTS / ignore errors). Add a new block
// here whenever src/lib/schema.js gains a column that isn't in scripts/seed.js.
const migrations = [
  // Add overtime_count to attendances (per-occurrence count for shift overtime)
  `ALTER TABLE attendances ADD COLUMN overtime_count INTEGER NOT NULL DEFAULT 0`,
  // Add late_with_permission boolean to attendances (manager override flag)
  `ALTER TABLE attendances ADD COLUMN late_with_permission INTEGER NOT NULL DEFAULT 0`,
  // Add early_leave_count to attendances (per-incident count)
  `ALTER TABLE attendances ADD COLUMN early_leave_count INTEGER NOT NULL DEFAULT 0`,
  // Add override_type text column to attendances (e.g. "terlambat_izin" | "ganti_shift" | ...)
  `ALTER TABLE attendances ADD COLUMN override_type TEXT`,
  // Add keterangan text column to attendances (e.g. "peringatan ke-1" | "terlambat")
  `ALTER TABLE attendances ADD COLUMN keterangan TEXT`,
];

// Run one-by-one and ignore "duplicate column" errors so re-runs are safe.
for (const sql of migrations) {
  try {
    await client.execute(sql);
    console.log("OK:", sql);
  } catch (e) {
    const msg = String(e.message || e);
    if (/duplicate column|already exists/i.test(msg)) {
      console.log("SKIP (already exists):", sql);
    } else {
      console.error("FAIL:", sql, "\n  ", msg);
    }
  }
}

console.log("Done.");
client.close();
