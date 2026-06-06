// scripts/migrate-payroll-adjustment-id.js
// Tambah kolom applied_to_payroll_id & applied_at ke tabel adjustments
// Jalankan sekali: node scripts/migrate-payroll-adjustment-id.js

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../hr.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

function columnExists(table, column) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some(r => r.name === column);
}

const migrations = [
  { table: "adjustments", column: "applied_to_payroll_id", def: "INTEGER REFERENCES payrolls(id)" },
  { table: "adjustments", column: "applied_at",           def: "TEXT" },
];

let applied = 0;
for (const m of migrations) {
  if (columnExists(m.table, m.column)) {
    console.log(`✓ ${m.table}.${m.column} sudah ada`);
    continue;
  }
  db.exec(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.def}`);
  console.log(`+ ALTER TABLE ${m.table} ADD COLUMN ${m.column}`);
  applied++;
}

console.log(`\nSelesai: ${applied} kolom ditambahkan.`);
db.close();
