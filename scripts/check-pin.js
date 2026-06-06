// scripts/check-pin.js
// Usage: node scripts/check-pin.js <pin>
// Example: node scripts/check-pin.js 1234

const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", process.env.DATABASE_URL || "./hr.db");

async function main() {
  const pin = process.argv[2];
  if (!pin) {
    console.log("Usage: node scripts/check-pin.js <pin>");
    console.log("Example: node scripts/check-pin.js 1234");
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  const users = db.prepare("SELECT id, name, pin, role FROM users WHERE is_active = 1").all();

  console.log(`Checking PIN: ${pin}`);
  console.log(`Total users: ${users.length}`);
  console.log("─".repeat(50));

  let found = null;
  for (const user of users) {
    const match = await bcrypt.compare(pin, user.pin);
    if (match) {
      found = user;
      break;
    }
  }

  if (found) {
    console.log(`✓ PIN MATCH!`);
    console.log(`  User ID: ${found.id}`);
    console.log(`  Name: ${found.name}`);
    console.log(`  Role: ${found.role}`);
  } else {
    console.log(`✗ PIN not found in any user account`);
  }

  db.close();
}

main().catch(console.error);