// scripts/refresh-session-secret.js
// Replace SESSION_SECRET in Vercel with a fresh one (and also update
// .env.production.local so local & production stay in sync).

import { execSync } from "child_process";
import { randomBytes } from "crypto";
import { readFileSync, writeFileSync } from "fs";

const sessionSecret = randomBytes(32).toString("hex");
console.log(`Generated new SESSION_SECRET (length: ${sessionSecret.length})`);

// 1. Remove old SESSION_SECRET from Vercel production
try {
  execSync(`vercel env rm SESSION_SECRET production --yes`, { stdio: "inherit" });
  console.log("  - Removed old SESSION_SECRET from Vercel");
} catch (e) {
  console.error("  ! Failed to remove:", e.message);
}

// 2. Add new SESSION_SECRET to Vercel production
try {
  execSync(`vercel env add SESSION_SECRET production --yes`, {
    input: sessionSecret + "\n",
    stdio: ["pipe", "inherit", "inherit"],
  });
  console.log("  + Added new SESSION_SECRET to Vercel");
} catch (e) {
  console.error("  ! Failed to add:", e.message);
  process.exit(1);
}

// 3. Update .env.production.local so local & production match
const path = ".env.production.local";
let content = readFileSync(path, "utf8");
if (content.match(/^SESSION_SECRET=/m)) {
  content = content.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${sessionSecret}`);
} else {
  content += `\nSESSION_SECRET=${sessionSecret}\n`;
}
writeFileSync(path, content);
console.log("  + Updated .env.production.local");
console.log("Done.");
