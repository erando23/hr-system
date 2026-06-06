// scripts/test-login-prod.js
// Replicates the login route's DB queries against prod Turso using the same client.
// Verifies that all columns referenced by Drizzle/autoFill actually exist.

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;
if (!url || !authToken) { console.error("Missing DATABASE_URL or DATABASE_AUTH_TOKEN"); process.exit(1); }

const client = createClient({ url, authToken });
const userId = process.argv[2] || "e1";
const pin = process.argv[3] || "123456";

async function main() {
  const userRes = await client.execute({
    sql: "SELECT id, name, role, outlet_id, dept, gaji, pin, is_active FROM users WHERE id = ? AND is_active = 1",
    args: [userId],
  });
  if (userRes.rows.length === 0) { console.log("FAIL: user not found / inactive"); process.exit(1); }
  const u = userRes.rows[0];
  console.log("user:", u.name, "| role:", u.role);

  if (String(u.pin) !== pin) { console.log(`FAIL: PIN mismatch (stored="${u.pin}", given="${pin}")`); process.exit(1); }
  console.log("PIN: OK");

  // Try the exact SELECT the login route issues (Drizzle uses the schema columns)
  console.log("Probing columns used by login route...");
  const columnsToCheck = [
    "overtime_count", "late_with_permission", "early_leave_count",
    "override_type", "keterangan", "late_mins", "early_mins", "overtime_mins",
    "shift_key", "status", "date", "user_id", "check_in", "check_out"
  ];
  for (const c of columnsToCheck) {
    try {
      await client.execute(`SELECT ${c} FROM attendances LIMIT 1`);
      console.log(`  ${c}: OK`);
    } catch (e) {
      console.log(`  ${c}: MISSING (${e.message})`);
    }
  }

  console.log("\nProbing full attendances SELECT (simulates login/route.js line 78)...");
  try {
    const r = await client.execute("SELECT * FROM attendances");
    console.log(`  OK: ${r.rows.length} rows`);
  } catch (e) { console.log(`  FAIL: ${e.message}`); process.exit(1); }

  // Try autoFill logic — the columns it tries to insert
  console.log("\nProbing autoFill INSERT columns...");
  const insertCols = [
    "overtime_mins", "late_mins", "early_mins",
    "shift_key", "status", "date", "user_id", "day_idx", "week_idx",
    "check_in", "check_out", "note", "override_by", "created_at",
  ];
  for (const c of insertCols) {
    try {
      await client.execute(`SELECT ${c} FROM attendances LIMIT 1`);
      console.log(`  ${c}: OK`);
    } catch (e) { console.log(`  ${c}: MISSING`); }
  }

  console.log("\nLOGIN OK");
}
main().catch(e => { console.error("ERROR:", e); process.exit(1); });
