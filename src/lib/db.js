// src/lib/db.js
// Database connection — SQLite (lokal dev) atau Turso/libSQL (production)

import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema.js";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL || path.join(process.cwd(), "hr.db");
const isTurso = DATABASE_URL.startsWith("libsql://") || DATABASE_URL.startsWith("https://");

let _db = null;

function createLocalDb() {
  const sqlite = new Database(DATABASE_URL);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzleSqlite(sqlite, { schema });
}

function createTursoDb() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return drizzleLibsql(client, { schema });
}

export function getDb() {
  if (!_db) {
    _db = isTurso ? createTursoDb() : createLocalDb();
  }
  return _db;
}

export const db = getDb();