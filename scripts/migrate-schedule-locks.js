// scripts/migrate-schedule-locks.js
// Run once: node scripts/migrate-schedule-locks.js
// Adds schedule_locks table and offDay column to outlets

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../hr.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

console.log("🔄 Running migration: schedule locks & outlet offDay...");

try {
  // Add offDay column to outlets (if not exists)
  sqlite.exec(`
    ALTER TABLE outlets ADD COLUMN off_day INTEGER DEFAULT NULL;
  `);
  console.log("  ✓ Added off_day column to outlets");
} catch (e) {
  if (e.message.includes("duplicate column")) {
    console.log("  ⊘ off_day column already exists");
  } else {
    console.error("  ✗ Error adding off_day:", e.message);
  }
}

try {
  // Create schedule_locks table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schedule_locks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      outlet_id TEXT NOT NULL REFERENCES outlets(id),
      month TEXT NOT NULL,
      is_locked INTEGER DEFAULT 0,
      locked_by TEXT,
      locked_at TEXT,
      updated_by TEXT,
      updated_at TEXT,
      UNIQUE(outlet_id, month)
    );
  `);
  console.log("  ✓ Created schedule_locks table");
} catch (e) {
  console.error("  ✗ Error creating schedule_locks:", e.message);
}

console.log("✅ Migration complete!");
sqlite.close();
