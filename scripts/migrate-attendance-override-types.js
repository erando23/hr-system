// scripts/migrate-attendance-override-types.js
// Migration: Add lateWithPermission and earlyLeaveCount columns to attendances table
// This supports the new override type system:
// - lateWithPermission: tracks late days where manager gave permission (max 3x/month)
// - earlyLeaveCount: tracks early leave incidents for payroll deduction
// Run: node scripts/migrate-attendance-override-types.js

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../hr.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

console.log("🔄 Running migration: attendance override types...");

try {
  // Check if late_with_permission column exists
  const tableInfo = sqlite.prepare("PRAGMA table_info(attendances)").all();
  const hasLatePermission = tableInfo.some(col => col.name === "late_with_permission");
  const hasEarlyLeaveCount = tableInfo.some(col => col.name === "early_leave_count");

  if (hasLatePermission && hasEarlyLeaveCount) {
    console.log("  ⊘ Migration already applied. Columns already exist.");
  } else {
    if (!hasLatePermission) {
      sqlite.exec(`
        ALTER TABLE attendances
        ADD COLUMN late_with_permission INTEGER DEFAULT 0
      `);
      console.log("  ✓ Added late_with_permission column");
    }

    if (!hasEarlyLeaveCount) {
      sqlite.exec(`
        ALTER TABLE attendances
        ADD COLUMN early_leave_count INTEGER DEFAULT 0
      `);
      console.log("  ✓ Added early_leave_count column");
    }

    console.log("✅ Migration completed successfully!");
  }

  console.log("\n📋 New override types available:");
  console.log("  • Terlambat (memberikan izin) → hadir (max 3x/month, beyond 3x = terlambat)");
  console.log("  • Gantikan Shift Teman → Lembur +1× (paid at overtime rate)");
  console.log("  • Tidak Masuk dengan Izin → Alpa");
  console.log("  • Tanpa Keterangan → Alpa");
  console.log("  • Pulang Lebih Cepat → deducted at overtime rate (per incident)");
  console.log("  • Lembur → Lembur +1× (60min at overtime rate)");

} catch (e) {
  console.error("  ✗ Migration failed:", e.message);
  process.exit(1);
} finally {
  sqlite.close();
  process.exit(0);
}