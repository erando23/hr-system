// scripts/push-env-vercel.js
// Read DATABASE_URL & DATABASE_AUTH_TOKEN from .env.production.local,
// then push them to Vercel (production env) for the linked project.
// Also generates a fresh SESSION_SECRET.

import { readFileSync } from "fs";
import { execSync } from "child_process";
import { randomBytes } from "crypto";

function readEnvFile(path) {
  const content = readFileSync(path, "utf8");
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    out[key] = val;
  }
  return out;
}

const env = readEnvFile(".env.production.local");

if (!env.DATABASE_URL || !env.DATABASE_AUTH_TOKEN) {
  console.error("Missing DATABASE_URL or DATABASE_AUTH_TOKEN in .env.production.local");
  process.exit(1);
}
if (env.DATABASE_URL.startsWith("REPLACE")) {
  console.error("DATABASE_URL masih placeholder — isi dulu di .env.production.local");
  process.exit(1);
}

const sessionSecret = randomBytes(32).toString("hex");

function setVar(name, value) {
  // vercel env add NAME production — use stdin for non-interactive input
  try {
    execSync(`vercel env add ${name} production --yes`, {
      input: value + "\n",
      stdio: ["pipe", "inherit", "inherit"],
    });
    console.log(`  + ${name}`);
  } catch (e) {
    console.error(`  ! Gagal set ${name}:`, e.message);
  }
}

console.log("Pushing env vars ke Vercel (production):");
setVar("SESSION_SECRET", sessionSecret);
setVar("DATABASE_URL", env.DATABASE_URL);
setVar("DATABASE_AUTH_TOKEN", env.DATABASE_AUTH_TOKEN);
console.log("Selesai.");
