// scripts/migrate-libsql.js
// Migrasi schema ke Turso/libSQL
// Usage: DATABASE_URL="libsql://xxx" DATABASE_AUTH_TOKEN="xxx" node scripts/migrate-libsql.js

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || (!url.startsWith("libsql://") && !url.startsWith("https://"))) {
  console.error("DATABASE_URL harus libsql:// atau https:// (Turso)");
  process.exit(1);
}

const client = createClient({ url, authToken });

const TABLES = [
  `CREATE TABLE IF NOT EXISTS outlets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    radius INTEGER DEFAULT 50,
    is_single_shift INTEGER DEFAULT 0,
    outlet_hours TEXT,
    off_day INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    outlet_id TEXT REFERENCES outlets(id),
    dept TEXT NOT NULL,
    gaji INTEGER NOT NULL DEFAULT 0,
    role TEXT NOT NULL,
    pin TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    week_idx INTEGER NOT NULL,
    day_idx INTEGER NOT NULL,
    day_num INTEGER NOT NULL,
    month TEXT NOT NULL,
    shift_key TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS attendances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    day_idx INTEGER NOT NULL,
    check_in TEXT,
    check_out TEXT,
    check_in_lat REAL,
    check_in_lng REAL,
    check_out_lat REAL,
    check_out_lng REAL,
    late_minutes INTEGER DEFAULT 0,
    early_leave_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'belum',
    note TEXT,
    override_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS kasbon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    note TEXT,
    status TEXT DEFAULT 'pending',
    approved_by TEXT,
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    note TEXT,
    month TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS payrolls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    month TEXT NOT NULL,
    gaji_pokok INTEGER NOT NULL,
    hari_kerja INTEGER DEFAULT 0,
    hari_hadir INTEGER DEFAULT 0,
    hari_telat INTEGER DEFAULT 0,
    total_overtime_hours REAL DEFAULT 0,
    lembur_amount INTEGER DEFAULT 0,
    bonus_amount INTEGER DEFAULT 0,
    kasbon_amount INTEGER DEFAULT 0,
    potongan_telat INTEGER DEFAULT 0,
    potongan_early INTEGER DEFAULT 0,
    potongan_lain INTEGER DEFAULT 0,
    total_potongan INTEGER DEFAULT 0,
    gaji_bersih INTEGER NOT NULL,
    status TEXT DEFAULT 'draft',
    detail_lembur TEXT,
    detail_bonus TEXT,
    detail_kasbon TEXT,
    detail_potongan TEXT,
    approved_by TEXT,
    paid_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS schedule_locks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outlet_id TEXT NOT NULL REFERENCES outlets(id),
    month TEXT NOT NULL,
    is_locked INTEGER DEFAULT 0,
    locked_by TEXT,
    locked_at TEXT,
    updated_by TEXT,
    updated_at TEXT,
    UNIQUE(outlet_id, month)
  )`,
  `CREATE TABLE IF NOT EXISTS payroll_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payroll_id INTEGER NOT NULL REFERENCES payrolls(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    note TEXT,
    source_adjustment_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function main() {
  console.log("Migrating ke", url);
  for (const sql of TABLES) {
    try {
      await client.execute(sql);
      console.log("  ✓", sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1]);
    } catch (e) {
      console.error("  ✗ Error:", e.message);
    }
  }
  console.log("\nMigrasi selesai. Lanjutkan dengan seeding: npm run db:seed:turso");
  client.close();
}

main().catch(console.error);