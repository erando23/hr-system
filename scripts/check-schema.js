import Database from "better-sqlite3";
const db = new Database("./hr.db");
const tables = ["outlets", "users", "schedules", "attendances", "kasbon", "adjustments", "payrolls", "payroll_adjustments", "schedule_locks"];
for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info(${t})`).all();
  console.log(`\n${t} (${cols.length} cols):`);
  cols.forEach(c => console.log(`  ${c.name} (${c.type})`));
}
db.close();