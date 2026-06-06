// scripts/seed.js
// Jalankan sekali: node scripts/seed.js
// Mengisi database awal dengan data demo

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../src/lib/schema.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../hr.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getDayAndWeek(date) {
  const jsDay = date.getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const weekIdx = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
  return { dayIdx, weekIdx };
}

// Helper: generate attendance for one employee for a given month
// pattern: "perfect" | "good" | "mixed" | "problem" | "heavy"
function generateAttendance(empId, month, pattern, scheduleRows) {
  const records = [];
  const [year, monthNum] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthNum - 1, day);
    const dateStr = `${month}-${String(day).padStart(2, "0")}`;
    const { dayIdx, weekIdx } = getDayAndWeek(date);
    const weekday = date.getDay(); // 0=Sun, 1=Mon,...,6=Sat

    // Skip Sunday
    if (weekday === 0) continue;

    // Find schedule for this day
    const sched = scheduleRows.find(s => s.dayNum === day);
    if (!sched || sched.shiftKey === "L") continue; // skip libur days

    const shiftKey = sched.shiftKey;
    const shiftStart = { P: "07:00", S: "11:00", M: "15:00" }[shiftKey] || "07:00";
    const shiftEnd   = { P: "15:00", S: "19:00", M: "23:00" }[shiftKey] || "15:00";

    const empNum = parseInt(empId.replace(/\D/g, "")) || 1;
    const seed = empNum + day + monthNum * 100;

    const rand = (min, max) => min + Math.floor((Math.sin(seed * 7.3 + day * 3.1) + 1) * (max - min) / 2);

    const shouldBeAbsent = (() => {
      if (pattern === "perfect")  return false;
      if (pattern === "good")    return day % 60 === 0;
      if (pattern === "mixed")    return day % 25 === 0;
      if (pattern === "problem") return day % 12 === 0;
      if (pattern === "heavy")   return day % 7 === 0;
      return false;
    })();

    if (shouldBeAbsent) {
      // Alpa or izin
      const isIzin = seed % 3 === 0;
      records.push({
        userId: empId, date: dateStr, dayIdx, weekIdx, shiftKey,
        status: isIzin ? "izin" : "alpa",
        checkIn: null, checkOut: null,
        checkInLat: null, checkInLng: null, checkOutLat: null, checkOutLng: null,
        lateMins: 0, earlyMins: 0, overtimeMins: 0,
        note: isIzin ? "Izin sakit" : "Alpha tidak hadir",
        overrideBy: null,
      });
      continue;
    }

    // Normal hadir — determine check-in time
    const isLate = (() => {
      if (pattern === "perfect") return false;
      if (pattern === "good")   return seed % 20 === 0;
      if (pattern === "mixed")  return seed % 10 === 0;
      if (pattern === "problem") return seed % 5 === 0;
      if (pattern === "heavy")  return seed % 4 === 0;
      return false;
    })();

    const lateMinutes = isLate ? rand(5, 45) : 0;

    // Check-in time = shift start + late minutes
    const [sh, sm] = shiftStart.split(":").map(Number);
    const ciTotalMins = sh * 60 + sm + lateMinutes;
    const checkInTime = `${String(Math.floor(ciTotalMins / 60)).padStart(2,"0")}:${String(ciTotalMins % 60).padStart(2,"0")}`;

    // Check-out — determine if overtime or early leave
    const [eh, em] = shiftEnd.split(":").map(Number);
    const shiftEndMins = eh * 60 + em;

    const doOvertime = seed % 7 === 0 && pattern !== "problem" && pattern !== "heavy";
    const doEarlyLeave = seed % 11 === 0 && pattern === "mixed";

    const overtimeMins = doOvertime ? rand(30, 120) : 0;
    const earlyMins = doEarlyLeave ? rand(15, 60) : 0;

    let checkOutTime = null;
    if (doOvertime) {
      const coTotalMins = shiftEndMins + overtimeMins;
      checkOutTime = `${String(Math.floor(coTotalMins / 60)).padStart(2,"0")}:${String(coTotalMins % 60).padStart(2,"0")}`;
    } else if (doEarlyLeave) {
      const coTotalMins = shiftEndMins - earlyMins;
      checkOutTime = `${String(Math.floor(coTotalMins / 60)).padStart(2,"0")}:${String(coTotalMins % 60).padStart(2,"0")}`;
    } else {
      checkOutTime = shiftEnd;
    }

    records.push({
      userId: empId, date: dateStr, dayIdx, weekIdx, shiftKey,
      status: lateMinutes > 15 ? "hadir" : "hadir", // tetap hadir, lateMins yang track
      checkIn: checkInTime, checkOut: checkOutTime,
      checkInLat: -6.21 + (seed % 100) * 0.0001,
      checkInLng: 106.82 + (seed % 100) * 0.0001,
      checkOutLat: -6.21 + (seed % 100) * 0.0001,
      checkOutLng: 106.82 + (seed % 100) * 0.0001,
      lateMins: lateMinutes,
      earlyMins: earlyMins,
      overtimeMins: overtimeMins,
      note: lateMinutes > 15 ? `Terlambat ${lateMinutes} menit` : (overtimeMins > 0 ? `Lembur ${overtimeMins} menit` : ""),
      overrideBy: null,
    });
  }

  return records;
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Hapus semua data existing (reset)
  sqlite.exec(`
    DROP TABLE IF EXISTS payroll_adjustments;
    DROP TABLE IF EXISTS payrolls;
    DROP TABLE IF EXISTS adjustments;
    DROP TABLE IF EXISTS kasbon;
    DROP TABLE IF EXISTS attendances;
    DROP TABLE IF EXISTS schedules;
    DROP TABLE IF EXISTS schedule_locks;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS outlets;
  `);

  // Buat tabel
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS outlets (
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
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      outlet_id TEXT REFERENCES outlets(id),
      dept TEXT NOT NULL,
      gaji INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL,
      pin TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      week_idx INTEGER NOT NULL,
      day_idx INTEGER NOT NULL,
      day_num INTEGER NOT NULL,
      month TEXT NOT NULL,
      shift_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      day_idx INTEGER NOT NULL,
      week_idx INTEGER NOT NULL,
      shift_key TEXT NOT NULL,
      status TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      check_in_lat REAL,
      check_in_lng REAL,
      check_out_lat REAL,
      check_out_lng REAL,
      late_mins INTEGER DEFAULT 0,
      early_mins INTEGER DEFAULT 0,
      overtime_mins INTEGER DEFAULT 0,
      overtime_count INTEGER DEFAULT 0,
      late_with_permission INTEGER DEFAULT 0,
      early_leave_count INTEGER DEFAULT 0,
      note TEXT DEFAULT '',
      override_by TEXT,
      override_type TEXT,
      keterangan TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS kasbon (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      approved_by TEXT,
      reject_note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      applied_to_payroll_id INTEGER REFERENCES payrolls(id),
      applied_at TEXT
    );

    CREATE TABLE IF NOT EXISTS payrolls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      month TEXT NOT NULL,
      gaji_pokok INTEGER NOT NULL,
      total_hadir INTEGER DEFAULT 0,
      total_late INTEGER DEFAULT 0,
      total_late_mins INTEGER DEFAULT 0,
      total_alpha INTEGER DEFAULT 0,
      total_overtime_mins INTEGER DEFAULT 0,
      plus_lembur INTEGER DEFAULT 0,
      plus_bonus INTEGER DEFAULT 0,
      pot_terlambat INTEGER DEFAULT 0,
      pot_early_leave INTEGER DEFAULT 0,
      pot_kasbon INTEGER DEFAULT 0,
      pot_lainnya INTEGER DEFAULT 0,
      detail_lembur TEXT DEFAULT '',
      detail_bonus TEXT DEFAULT '',
      detail_kasbon TEXT DEFAULT '',
      detail_potongan TEXT DEFAULT '',
      gaji_bersih INTEGER NOT NULL,
      status TEXT DEFAULT 'draft',
      generated_by TEXT,
      generated_at TEXT,
      paid_at TEXT
    );

    CREATE TABLE IF NOT EXISTS payroll_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payroll_id INTEGER NOT NULL REFERENCES payrolls(id),
      adj_type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      note TEXT DEFAULT '',
      created_by TEXT
    );
  `);

  const today = todayStr();

  // ── OUTLETS ──────────────────────────────────────────────
  const outletData = [
    { id:"o1", name:"Outlet Sudirman", address:"Jl. Sudirman No.1, Jakarta", lat:-6.2088, lng:106.8456,
      outletHours: JSON.stringify({ shiftStart:"07:00", shiftEnd:"21:00", shift1Start:"07:00", shift1End:"14:00", shift2Start:"14:00", shift2End:"21:00" }) },
    { id:"o2", name:"Outlet Senayan",  address:"Jl. Asia Afrika, Jakarta",  lat:-6.2180, lng:106.8020,
      outletHours: JSON.stringify({ shiftStart:"08:00", shiftEnd:"22:00", shift1Start:"08:00", shift1End:"15:00", shift2Start:"15:00", shift2End:"22:00" }) },
    { id:"o3", name:"Outlet Kemang",   address:"Jl. Kemang Raya No.5, Jakarta", lat:-6.2600, lng:106.8140,
      outletHours: JSON.stringify({ shiftStart:"09:00", shiftEnd:"23:00", shift1Start:"09:00", shift1End:"16:00", shift2Start:"16:00", shift2End:"23:00" }) },
  ];

  for (const o of outletData) {
    sqlite.prepare("INSERT OR IGNORE INTO outlets (id,name,address,lat,lng,outlet_hours) VALUES (?,?,?,?,?,?)")
      .run(o.id, o.name, o.address, o.lat, o.lng, o.outletHours);
  }
  console.log("  ✓ Outlets seeded");

  // ── USERS ─────────────────────────────────────────────────
  // PINs MUST match HRApp.js frontend EMPLOYEES_INIT
  const usersData = [
    // Outlet Sudirman (o1) - 16 karyawan
    { id:"e1",  name:"Andi Saputra",   outlet:"o1", dept:"Outlet",   gaji:3200000, role:"karyawan", pin:"100001" },
    { id:"e2",  name:"Budi Hartono",   outlet:"o1", dept:"Outlet",   gaji:3200000, role:"karyawan", pin:"100002" },
    { id:"e3",  name:"Citra Dewi",     outlet:"o1", dept:"Outlet",   gaji:3200000, role:"karyawan", pin:"100003" },
    { id:"e4",  name:"Dewi Anggraini",outlet:"o1", dept:"Outlet",   gaji:3200000, role:"karyawan", pin:"100004" },
    { id:"e5",  name:"Eko Prasetyo",   outlet:"o1", dept:"Kitchen",  gaji:3500000, role:"karyawan", pin:"100105" },
    { id:"e6",  name:"Fitri Handayani",outlet:"o1",dept:"Kitchen",  gaji:3500000, role:"karyawan", pin:"100106" },
    { id:"e7",  name:"Galih Wicaksono",outlet:"o1",dept:"Kitchen",  gaji:3500000, role:"karyawan", pin:"100107" },
    { id:"e8",  name:"Hana Kusuma",    outlet:"o1", dept:"Kitchen",  gaji:3500000, role:"karyawan", pin:"100108" },
    { id:"e9",  name:"Indra Permana",   outlet:"o1", dept:"Kasir",   gaji:3300000, role:"karyawan", pin:"100109" },
    { id:"e10", name:"Jeni Rahayu",    outlet:"o1", dept:"Kasir",   gaji:3300000, role:"karyawan", pin:"100110" },
    { id:"e11", name:"Kevin Santoso",  outlet:"o1", dept:"Kasir",   gaji:3300000, role:"karyawan", pin:"100111" },
    { id:"e12", name:"Lina Agustina",  outlet:"o1", dept:"Kasir",   gaji:3300000, role:"karyawan", pin:"100112" },
    { id:"e13", name:"Miko Hendra",   outlet:"o1", dept:"Security",gaji:3100000, role:"karyawan", pin:"100113" },
    { id:"e14", name:"Nanda Irawan",   outlet:"o1", dept:"Security",gaji:3100000, role:"karyawan", pin:"100114" },
    { id:"e15", name:"Omar Fauzi",     outlet:"o1", dept:"Security",gaji:3100000, role:"karyawan", pin:"100115" },
    { id:"e16", name:"Puja Wulandari", outlet:"o1", dept:"Security",gaji:3100000, role:"karyawan", pin:"100116" },
    // Outlet Senayan (o2) - 16 karyawan
    { id:"e17", name:"Raka Aditya",   outlet:"o2", dept:"Outlet",   gaji:3200000, role:"karyawan", pin:"200001" },
    { id:"e18", name:"Sari Maharani",  outlet:"o2", dept:"Outlet",   gaji:3200000, role:"karyawan", pin:"200002" },
    { id:"e19", name:"Toni Susanto",   outlet:"o2", dept:"Outlet",   gaji:3200000, role:"karyawan", pin:"200003" },
    { id:"e20", name:"Umi Kalsum",     outlet:"o2", dept:"Outlet",   gaji:3200000, role:"karyawan", pin:"200004" },
    { id:"e21", name:"Vino Wirawan",   outlet:"o2", dept:"Kitchen",  gaji:3500000, role:"karyawan", pin:"200005" },
    { id:"e22", name:"Wati Lestari",   outlet:"o2", dept:"Kitchen",  gaji:3500000, role:"karyawan", pin:"200006" },
    { id:"e23", name:"Xena Putri",     outlet:"o2", dept:"Kitchen",  gaji:3500000, role:"karyawan", pin:"200007" },
    { id:"e24", name:"Yogi Pratama",   outlet:"o2", dept:"Kitchen",  gaji:3500000, role:"karyawan", pin:"200008" },
    { id:"e25", name:"Zara Novita",    outlet:"o2", dept:"Kasir",   gaji:3300000, role:"karyawan", pin:"200009" },
    { id:"e26", name:"Arif Budiman",   outlet:"o2", dept:"Kasir",   gaji:3300000, role:"karyawan", pin:"200010" },
    { id:"e27", name:"Bella Safitri",  outlet:"o2", dept:"Kasir",   gaji:3300000, role:"karyawan", pin:"200011" },
    { id:"e28", name:"Candra Wijaya",  outlet:"o2", dept:"Kasir",   gaji:3300000, role:"karyawan", pin:"200012" },
    { id:"e29", name:"Dian Pramesti",  outlet:"o2", dept:"Security",gaji:3100000, role:"karyawan", pin:"200013" },
    { id:"e30", name:"Edo Kurniawan",  outlet:"o2", dept:"Security",gaji:3100000, role:"karyawan", pin:"200014" },
    { id:"e31", name:"Fara Claudia",   outlet:"o2", dept:"Security",gaji:3100000, role:"karyawan", pin:"200015" },
    { id:"e32", name:"Gilang Ramadhan",outlet:"o2", dept:"Security",gaji:3100000, role:"karyawan", pin:"200016" },
    // Outlet Kemang (o3) - 16 karyawan
    { id:"e33", name:"Hesti Wulandari",outlet:"o3", dept:"Outlet",  gaji:3200000, role:"karyawan", pin:"300001" },
    { id:"e34", name:"Irfan Maulana",  outlet:"o3", dept:"Outlet",  gaji:3200000, role:"karyawan", pin:"300002" },
    { id:"e35", name:"Jasmine Aulia",  outlet:"o3", dept:"Outlet",  gaji:3200000, role:"karyawan", pin:"300003" },
    { id:"e36", name:"Krisna Bayu",    outlet:"o3", dept:"Outlet",  gaji:3200000, role:"karyawan", pin:"300004" },
    { id:"e37", name:"Luki Setiawan",  outlet:"o3", dept:"Kitchen", gaji:3500000, role:"karyawan", pin:"300005" },
    { id:"e38", name:"Mela Puspita",   outlet:"o3", dept:"Kitchen", gaji:3500000, role:"karyawan", pin:"300006" },
    { id:"e39", name:"Niko Pranata",   outlet:"o3", dept:"Kitchen", gaji:3500000, role:"karyawan", pin:"300039" },
    { id:"e40", name:"Okta Fitriani",  outlet:"o3", dept:"Kitchen", gaji:3500000, role:"karyawan", pin:"300040" },
    { id:"e41", name:"Panji Nugroho",   outlet:"o3", dept:"Kasir",  gaji:3300000, role:"karyawan", pin:"300041" },
    { id:"e42", name:"Qori Amelia",    outlet:"o3", dept:"Kasir",  gaji:3300000, role:"karyawan", pin:"300042" },
    { id:"e43", name:"Rizky Firmansyah",outlet:"o3",dept:"Kasir",  gaji:3300000, role:"karyawan", pin:"300043" },
    { id:"e44", name:"Sinta Larasati",  outlet:"o3", dept:"Kasir",  gaji:3300000, role:"karyawan", pin:"300044" },
    { id:"e45", name:"Taufik Hidayat",  outlet:"o3", dept:"Security",gaji:3100000, role:"karyawan", pin:"300045" },
    { id:"e46", name:"Umar Said",      outlet:"o3", dept:"Security",gaji:3100000, role:"karyawan", pin:"300046" },
    { id:"e47", name:"Vera Susanti",   outlet:"o3", dept:"Security",gaji:3100000, role:"karyawan", pin:"300047" },
    { id:"e48", name:"Wahyu Nugroho",  outlet:"o3", dept:"Security",gaji:3100000, role:"karyawan", pin:"300048" },
    // Managers
    { id:"m1",  name:"Sari Manajer",   outlet:"o1", dept:"Management",gaji:7000000, role:"manager",    pin:"900001" },
    { id:"m2",  name:"Rudi Manajer",   outlet:"o2", dept:"Management",gaji:7000000, role:"manager",    pin:"900002" },
    { id:"m3",  name:"Nina Manajer",   outlet:"o3", dept:"Management",gaji:7000000, role:"manager",    pin:"900003" },
    // Super Admin
    { id:"sa1", name:"Admin Super",    outlet:"o1", dept:"HQ",        gaji:12000000,role:"superadmin", pin:"000001" },
  ];

  for (const u of usersData) {
    sqlite.prepare("INSERT OR IGNORE INTO users (id,name,outlet_id,dept,gaji,role,pin) VALUES (?,?,?,?,?,?,?)")
      .run(u.id, u.name, u.outlet, u.dept, u.gaji, u.role, u.pin);
  }
  console.log(`  ✓ Users seeded (${usersData.length} users, PIN plaintext)`);

  // ── SCHEDULES ─────────────────────────────────────────────
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const karyawanUsers = usersData.filter(u => u.role === "karyawan");

  for (const emp of karyawanUsers) {
    const n = parseInt(emp.id.replace(/\D/g, ""));
    for (let w = 0; w < 4; w++) {
      const offDay = (n + w) % 4;
      for (let d = 0; d < 7; d++) {
        const dayNum = w * 7 + d + 1;
        if (dayNum > 31) continue;
        let shiftKey = ["P","S","M"][(n + d + w) % 3];
        if (d === offDay) shiftKey = "L";
        if (d === 6 && w % 2 === 0) shiftKey = "L";

        const exists = sqlite.prepare(
          "SELECT id FROM schedules WHERE user_id=? AND day_num=? AND month=?"
        ).get(emp.id, dayNum, monthStr);

        if (!exists) {
          sqlite.prepare("INSERT INTO schedules (user_id,week_idx,day_idx,day_num,month,shift_key) VALUES (?,?,?,?,?,?)")
            .run(emp.id, w, d, dayNum, monthStr, shiftKey);
        }
      }
    }
  }
  console.log("  ✓ Schedules seeded");

  // ── ATTENDANCES (DUMMY DATA) ──────────────────────────────
  console.log("  ⏳ Generating attendance data for May 2026...");
  const attInsert = sqlite.prepare(`
    INSERT OR IGNORE INTO attendances
      (user_id, date, day_idx, week_idx, shift_key, status, check_in, check_out,
       check_in_lat, check_in_lng, check_out_lat, check_out_lng, late_mins, early_mins, overtime_mins, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let attCount = 0;
  const insertAtt = (userId, date, dayIdx, weekIdx, shiftKey, status, checkIn, checkOut, lateMins, earlyMins, otMins, note) => {
    try {
      const r = attInsert.run(userId, date, dayIdx, weekIdx, shiftKey, status, checkIn, checkOut,
        -6.21 + Math.random() * 0.01, 106.82 + Math.random() * 0.01,
        -6.21 + Math.random() * 0.01, 106.82 + Math.random() * 0.01,
        lateMins, earlyMins, otMins, note);
      if (r.changes > 0) attCount++;
    } catch(e) { /* skip duplicates */ }
  };

  // Attendance patterns for each employee ID suffix
  const year = 2026, monthNum = 5; // May 2026
  const daysInMay = 31;

  for (const emp of karyawanUsers) {
    const empScheds = sqlite.prepare("SELECT * FROM schedules WHERE user_id=? AND month=?").all(emp.id, monthStr);
    const empSchedMap = {};
    for (const s of empScheds) empSchedMap[s.day_num] = s;

    // Deterministically pick pattern based on emp ID
    const n = parseInt(emp.id.replace(/\D/g, "")) || 1;
    const pat = ["perfect","good","mixed","mixed","problem","problem","heavy"][n % 7] || "mixed";

    for (let day = 1; day <= daysInMay; day++) {
      const date = new Date(year, monthNum - 1, day);
      const weekday = date.getDay(); // 0=Sun
      if (weekday === 0) continue; // skip Sunday

      const { dayIdx, weekIdx } = getDayAndWeek(date);
      const sched = empSchedMap[day];
      if (!sched || sched.shift_key === "L") continue; // skip libur

      const shiftKey = sched.shift_key;
      const shiftStartStr = { P:"07:00", S:"11:00", M:"15:00" }[shiftKey] || "07:00";
      const shiftEndStr   = { P:"15:00", S:"19:00", M:"23:00" }[shiftKey] || "15:00";
      const [sh, sm] = shiftStartStr.split(":").map(Number);
      const [eh, em] = shiftEndStr.split(":").map(Number);

      // Deterministic pseudo-random based on emp+day seed
      const seed = n * 1000 + day;
      const pseudoRand = () => Math.abs(Math.sin(seed * 7.3 + day * 3.1 + attCount * 5.7)) || 0.01;

      // Alpha / izin decision
      let isAlpa = false, isIzin = false;
      if (pat === "perfect") { isAlpa = false; isIzin = false; }
      else if (pat === "good")   { isAlpa = day % 60 === 0; isIzin = day % 35 === 0; }
      else if (pat === "mixed")  { isAlpa = day % 20 === 0; isIzin = day % 13 === 0; }
      else if (pat === "problem") { isAlpa = day % 10 === 0; isIzin = day % 15 === 0; }
      else if (pat === "heavy")  { isAlpa = day % 5 === 0;  isIzin = day % 8 === 0; }

      if (isAlpa) {
        insertAtt(emp.id, `2026-05-${String(day).padStart(2,"0")}`, dayIdx, weekIdx, shiftKey, "alpa", null, null, 0, 0, 0, "Alpha - tidak hadir");
        continue;
      }
      if (isIzin) {
        insertAtt(emp.id, `2026-05-${String(day).padStart(2,"0")}`, dayIdx, weekIdx, shiftKey, "izin", null, null, 0, 0, 0, "Izin sakit");
        continue;
      }

      // Hadir — determine late, overtime, early
      let lateMins = 0;
      if (pat !== "perfect") {
        if (pat === "good"    && day % 18 === 0) lateMins = 5 + Math.floor(pseudoRand() * 40);
        if (pat === "mixed"   && day % 10 === 0) lateMins = 10 + Math.floor(pseudoRand() * 35);
        if (pat === "problem" && day % 5 === 0)  lateMins = 15 + Math.floor(pseudoRand() * 30);
        if (pat === "heavy"   && day % 4 === 0)  lateMins = 20 + Math.floor(pseudoRand() * 25);
      }

      const ciTotal = (sh + sm / 60) * 60 + lateMins;
      const checkIn = `${String(Math.floor(ciTotal / 60)).padStart(2,"0")}:${String(Math.round(ciTotal % 60)).padStart(2,"0")}`;

      // Overtime: problem/heavy rarely do overtime
      let otMins = 0;
      if (pat !== "problem" && pat !== "heavy" && day % 7 === 0) otMins = 30 + Math.floor(pseudoRand() * 90);
      // Early leave: mixed/problem
      let earlyMins = 0;
      if ((pat === "mixed" || pat === "problem") && day % 11 === 0) earlyMins = 15 + Math.floor(pseudoRand() * 45);

      let checkOut = null;
      if (otMins > 0) {
        const coTotal = (eh + em / 60) * 60 + otMins;
        checkOut = `${String(Math.floor(coTotal / 60)).padStart(2,"0")}:${String(Math.round(coTotal % 60)).padStart(2,"0")}`;
      } else if (earlyMins > 0) {
        const coTotal = (eh + em / 60) * 60 - earlyMins;
        checkOut = `${String(Math.floor(coTotal / 60)).padStart(2,"0")}:${String(Math.round(Math.abs(coTotal % 60))).padStart(2,"0")}`;
      } else {
        checkOut = shiftEndStr;
      }

      let note = "";
      if (lateMins > 15) note = `Terlambat ${lateMins} menit`;
      else if (otMins > 0) note = `Lembur ${otMins} menit`;

      insertAtt(emp.id, `2026-05-${String(day).padStart(2,"0")}`, dayIdx, weekIdx, shiftKey, "hadir", checkIn, checkOut, lateMins, earlyMins, otMins, note);
    }
  }
  console.log(`  ✓ Attendances seeded (${attCount} records)`);

  // ── KASBON ────────────────────────────────────────────────
  const kasbonData = [
    { userId:"e1", amount:300000, note:"Kasbon darurat",    status:"aktif" },
    { userId:"e3", amount:200000, note:"Keperluan keluarga",status:"aktif" },
    { userId:"e5", amount:150000, note:"Biaya rumah sakit", status:"aktif" },
  ];
  for (const k of kasbonData) {
    const exists = sqlite.prepare("SELECT id FROM kasbon WHERE user_id=? AND note=?").get(k.userId, k.note);
    if (!exists) {
      sqlite.prepare("INSERT INTO kasbon (user_id,amount,date,note,status) VALUES (?,?,?,?,?)")
        .run(k.userId, k.amount, today, k.note, k.status);
    }
  }
  console.log("  ✓ Kasbon seeded");

  // ── ADJUSTMENTS ───────────────────────────────────────────
  const adjData = [
    { userId:"e2", type:"tambah", amount:50000,  note:"Apresiasi karyawan terbaik" },
    { userId:"e4", type:"potong", amount:25000,  note:"Pecah gelas 2x" },
    { userId:"e7", type:"tambah", amount:100000, note:"Lembur event khusus" },
  ];
  for (const a of adjData) {
    const exists = sqlite.prepare("SELECT id FROM adjustments WHERE user_id=? AND note=?").get(a.userId, a.note);
    if (!exists) {
      sqlite.prepare("INSERT INTO adjustments (user_id,type,amount,date,note,created_by) VALUES (?,?,?,?,?,?)")
        .run(a.userId, a.type, a.amount, today, a.note, "sa1");
    }
  }
  console.log("  ✓ Adjustments seeded");

  console.log("\n✅ Seeding selesai!");
  console.log("\n📋 Akun demo (PIN plaintext):");
  console.log("   Super Admin    : PIN 000001");
  console.log("   Manager Sudirman : PIN 900001");
  console.log("   Manager Senayan  : PIN 900002");
  console.log("   Manager Kemang   : PIN 900003");
  console.log("   Karyawan e1  : PIN 100001 (Outlet Sudirman)");
  console.log("   Karyawan e5  : PIN 100105 (Outlet Sudirman)");
  console.log("   Karyawan e17 : PIN 200001 (Outlet Senayan)");
  console.log("   Karyawan e33 : PIN 300001 (Outlet Kemang)");

  sqlite.close();
}

seed().catch(console.error);
