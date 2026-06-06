// scripts/seed-turso.js
// Seed database Turso (libSQL) — versi khusus production.
// Schema & data sample sama dengan scripts/seed.js (lokal SQLite).
//
// Pakai:
//   $env:DATABASE_URL="libsql://hr-system-prod-<org>.turso.io"
//   $env:DATABASE_AUTH_TOKEN="<token>"
//   node scripts/seed-turso.js
//
// ATAU isi .env.production.local lalu:
//   node --env-file=.env.production.local scripts/seed-turso.js

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("ERROR: DATABASE_URL dan DATABASE_AUTH_TOKEN harus di-set.");
  console.error("  Jalankan dengan --env-file=.env.production.local atau set manual di shell.");
  process.exit(1);
}

const client = createClient({ url, authToken });

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayAndWeek(date) {
  const jsDay = date.getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const weekIdx = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
  return { dayIdx, weekIdx };
}

async function exec(sql) {
  await client.execute(sql);
}

async function run(sql, args) {
  const r = await client.execute({ sql, args });
  return { changes: r.rowsAffected };
}

async function all(sql, args = []) {
  const r = await client.execute({ sql, args });
  return r.rows;
}

async function get(sql, args = []) {
  const rows = await all(sql, args);
  return rows[0] || null;
}

async function seed() {
  console.log("Seeding Turso database...");
  console.log(`  URL: ${url}`);

  // ── Reset: drop tables in reverse dependency order ──
  // Note: Turso/libSQL tidak izinkan multi-statement dalam satu execute call.
  console.log("  · Drop existing tables...");
  for (const sql of [
    "DROP TABLE IF EXISTS payroll_adjustments",
    "DROP TABLE IF EXISTS payrolls",
    "DROP TABLE IF EXISTS adjustments",
    "DROP TABLE IF EXISTS kasbon",
    "DROP TABLE IF EXISTS attendances",
    "DROP TABLE IF EXISTS schedules",
    "DROP TABLE IF EXISTS schedule_locks",
    "DROP TABLE IF EXISTS users",
    "DROP TABLE IF EXISTS outlets",
  ]) {
    await exec(sql);
  }

  // ── Schema ──
  console.log("  · Create tables...");
  for (const sql of [
    `CREATE TABLE outlets (
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
    )`,
    `CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      outlet_id TEXT REFERENCES outlets(id),
      dept TEXT NOT NULL,
      gaji INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL,
      pin TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      week_idx INTEGER NOT NULL,
      day_idx INTEGER NOT NULL,
      day_num INTEGER NOT NULL,
      month TEXT NOT NULL,
      shift_key TEXT NOT NULL
    )`,
    `CREATE TABLE attendances (
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
      note TEXT DEFAULT '',
      override_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE kasbon (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      approved_by TEXT,
      reject_note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE adjustments (
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
    )`,
    `CREATE TABLE payrolls (
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
    )`,
    `CREATE TABLE payroll_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payroll_id INTEGER NOT NULL REFERENCES payrolls(id),
      adj_type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      note TEXT DEFAULT '',
      created_by TEXT
    )`,
    `CREATE TABLE schedule_locks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      outlet_id TEXT NOT NULL REFERENCES outlets(id),
      month TEXT NOT NULL,
      is_locked INTEGER DEFAULT 0,
      locked_by TEXT,
      locked_at TEXT,
      updated_by TEXT,
      updated_at TEXT
    )`,
  ]) {
    await exec(sql);
  }

  const today = todayStr();
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // ── OUTLETS ──
  console.log("  · Seed outlets...");
  const outletData = [
    { id: "o1", name: "Outlet Sudirman", address: "Jl. Sudirman No.1, Jakarta", lat: -6.2088, lng: 106.8456,
      outletHours: JSON.stringify({ shiftStart: "07:00", shiftEnd: "21:00", shift1Start: "07:00", shift1End: "14:00", shift2Start: "14:00", shift2End: "21:00" }) },
    { id: "o2", name: "Outlet Senayan", address: "Jl. Asia Afrika, Jakarta", lat: -6.2180, lng: 106.8020,
      outletHours: JSON.stringify({ shiftStart: "08:00", shiftEnd: "22:00", shift1Start: "08:00", shift1End: "15:00", shift2Start: "15:00", shift2End: "22:00" }) },
    { id: "o3", name: "Outlet Kemang", address: "Jl. Kemang Raya No.5, Jakarta", lat: -6.2600, lng: 106.8140,
      outletHours: JSON.stringify({ shiftStart: "09:00", shiftEnd: "23:00", shift1Start: "09:00", shift1End: "16:00", shift2Start: "16:00", shift2End: "23:00" }) },
  ];
  for (const o of outletData) {
    await run(
      "INSERT OR IGNORE INTO outlets (id,name,address,lat,lng,outlet_hours) VALUES (?,?,?,?,?,?)",
      [o.id, o.name, o.address, o.lat, o.lng, o.outletHours]
    );
  }

  // ── USERS ──
  console.log("  · Seed users (52 akun demo)...");
  const usersData = [
    { id: "e1",  name: "Andi Saputra",    outlet: "o1", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "100001" },
    { id: "e2",  name: "Budi Hartono",    outlet: "o1", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "100002" },
    { id: "e3",  name: "Citra Dewi",      outlet: "o1", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "100003" },
    { id: "e4",  name: "Dewi Anggraini",  outlet: "o1", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "100004" },
    { id: "e5",  name: "Eko Prasetyo",    outlet: "o1", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "100105" },
    { id: "e6",  name: "Fitri Handayani", outlet: "o1", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "100106" },
    { id: "e7",  name: "Galih Wicaksono", outlet: "o1", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "100107" },
    { id: "e8",  name: "Hana Kusuma",     outlet: "o1", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "100108" },
    { id: "e9",  name: "Indra Permana",   outlet: "o1", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "100109" },
    { id: "e10", name: "Jeni Rahayu",     outlet: "o1", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "100110" },
    { id: "e11", name: "Kevin Santoso",   outlet: "o1", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "100111" },
    { id: "e12", name: "Lina Agustina",   outlet: "o1", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "100112" },
    { id: "e13", name: "Miko Hendra",     outlet: "o1", dept: "Security", gaji: 3100000, role: "karyawan", pin: "100113" },
    { id: "e14", name: "Nanda Irawan",    outlet: "o1", dept: "Security", gaji: 3100000, role: "karyawan", pin: "100114" },
    { id: "e15", name: "Omar Fauzi",      outlet: "o1", dept: "Security", gaji: 3100000, role: "karyawan", pin: "100115" },
    { id: "e16", name: "Puja Wulandari",  outlet: "o1", dept: "Security", gaji: 3100000, role: "karyawan", pin: "100116" },
    { id: "e17", name: "Raka Aditya",     outlet: "o2", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "200001" },
    { id: "e18", name: "Sari Maharani",   outlet: "o2", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "200002" },
    { id: "e19", name: "Toni Susanto",    outlet: "o2", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "200003" },
    { id: "e20", name: "Umi Kalsum",      outlet: "o2", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "200004" },
    { id: "e21", name: "Vino Wirawan",    outlet: "o2", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "200005" },
    { id: "e22", name: "Wati Lestari",    outlet: "o2", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "200006" },
    { id: "e23", name: "Xena Putri",      outlet: "o2", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "200007" },
    { id: "e24", name: "Yogi Pratama",    outlet: "o2", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "200008" },
    { id: "e25", name: "Zara Novita",     outlet: "o2", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "200009" },
    { id: "e26", name: "Arif Budiman",    outlet: "o2", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "200010" },
    { id: "e27", name: "Bella Safitri",   outlet: "o2", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "200011" },
    { id: "e28", name: "Candra Wijaya",   outlet: "o2", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "200012" },
    { id: "e29", name: "Dian Pramesti",   outlet: "o2", dept: "Security", gaji: 3100000, role: "karyawan", pin: "200013" },
    { id: "e30", name: "Edo Kurniawan",   outlet: "o2", dept: "Security", gaji: 3100000, role: "karyawan", pin: "200014" },
    { id: "e31", name: "Fara Claudia",    outlet: "o2", dept: "Security", gaji: 3100000, role: "karyawan", pin: "200015" },
    { id: "e32", name: "Gilang Ramadhan", outlet: "o2", dept: "Security", gaji: 3100000, role: "karyawan", pin: "200016" },
    { id: "e33", name: "Hesti Wulandari", outlet: "o3", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "300001" },
    { id: "e34", name: "Irfan Maulana",   outlet: "o3", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "300002" },
    { id: "e35", name: "Jasmine Aulia",   outlet: "o3", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "300003" },
    { id: "e36", name: "Krisna Bayu",     outlet: "o3", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "300004" },
    { id: "e37", name: "Luki Setiawan",   outlet: "o3", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "300005" },
    { id: "e38", name: "Mela Puspita",    outlet: "o3", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "300006" },
    { id: "e39", name: "Niko Pranata",    outlet: "o3", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "300039" },
    { id: "e40", name: "Okta Fitriani",   outlet: "o3", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "300040" },
    { id: "e41", name: "Panji Nugroho",   outlet: "o3", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "300041" },
    { id: "e42", name: "Qori Amelia",     outlet: "o3", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "300042" },
    { id: "e43", name: "Rizky Firmansyah",outlet: "o3", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "300043" },
    { id: "e44", name: "Sinta Larasati",  outlet: "o3", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "300044" },
    { id: "e45", name: "Taufik Hidayat",  outlet: "o3", dept: "Security", gaji: 3100000, role: "karyawan", pin: "300045" },
    { id: "e46", name: "Umar Said",       outlet: "o3", dept: "Security", gaji: 3100000, role: "karyawan", pin: "300046" },
    { id: "e47", name: "Vera Susanti",    outlet: "o3", dept: "Security", gaji: 3100000, role: "karyawan", pin: "300047" },
    { id: "e48", name: "Wahyu Nugroho",   outlet: "o3", dept: "Security", gaji: 3100000, role: "karyawan", pin: "300048" },
    { id: "m1",  name: "Sari Manajer",    outlet: "o1", dept: "Management", gaji: 7000000, role: "manager",    pin: "900001" },
    { id: "m2",  name: "Rudi Manajer",    outlet: "o2", dept: "Management", gaji: 7000000, role: "manager",    pin: "900002" },
    { id: "m3",  name: "Nina Manajer",    outlet: "o3", dept: "Management", gaji: 7000000, role: "manager",    pin: "900003" },
    { id: "sa1", name: "Admin Super",     outlet: "o1", dept: "HQ",         gaji: 12000000, role: "superadmin", pin: "000001" },
  ];

  for (const u of usersData) {
    await run(
      "INSERT OR IGNORE INTO users (id,name,outlet_id,dept,gaji,role,pin) VALUES (?,?,?,?,?,?,?)",
      [u.id, u.name, u.outlet, u.dept, u.gaji, u.role, u.pin]
    );
  }

  // ── SCHEDULES ──
  console.log("  · Seed schedules...");
  const karyawanUsers = usersData.filter((u) => u.role === "karyawan");
  for (const emp of karyawanUsers) {
    const n = parseInt(emp.id.replace(/\D/g, ""));
    for (let w = 0; w < 4; w++) {
      const offDay = (n + w) % 4;
      for (let d = 0; d < 7; d++) {
        const dayNum = w * 7 + d + 1;
        if (dayNum > 31) continue;
        let shiftKey = ["P", "S", "M"][(n + d + w) % 3];
        if (d === offDay) shiftKey = "L";
        if (d === 6 && w % 2 === 0) shiftKey = "L";
        const exists = await get(
          "SELECT id FROM schedules WHERE user_id=? AND day_num=? AND month=?",
          [emp.id, dayNum, monthStr]
        );
        if (!exists) {
          await run(
            "INSERT INTO schedules (user_id,week_idx,day_idx,day_num,month,shift_key) VALUES (?,?,?,?,?,?)",
            [emp.id, w, d, dayNum, monthStr, shiftKey]
          );
        }
      }
    }
  }

  // ── ATTENDANCES ──
  console.log("  · Generate attendances...");
  const year = now.getFullYear();
  const monthNum = now.getMonth() + 1;
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  let attCount = 0;

  for (const emp of karyawanUsers) {
    const empScheds = await all("SELECT * FROM schedules WHERE user_id=? AND month=?", [emp.id, monthStr]);
    const empSchedMap = {};
    for (const s of empScheds) empSchedMap[s.day_num] = s;

    const n = parseInt(emp.id.replace(/\D/g, "")) || 1;
    const pat = ["perfect", "good", "mixed", "mixed", "problem", "problem", "heavy"][n % 7] || "mixed";

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNum - 1, day);
      const weekday = date.getDay();
      if (weekday === 0) continue;
      if (date > now) continue; // skip future days

      const { dayIdx, weekIdx } = getDayAndWeek(date);
      const sched = empSchedMap[day];
      if (!sched || sched.shift_key === "L") continue;

      const shiftKey = sched.shift_key;
      const shiftStartStr = { P: "07:00", S: "11:00", M: "15:00" }[shiftKey] || "07:00";
      const shiftEndStr = { P: "15:00", S: "19:00", M: "23:00" }[shiftKey] || "15:00";
      const [sh, sm] = shiftStartStr.split(":").map(Number);
      const [eh, em] = shiftEndStr.split(":").map(Number);

      const seedR = n * 1000 + day;
      const pseudoRand = () => Math.abs(Math.sin(seedR * 7.3 + day * 3.1 + attCount * 5.7)) || 0.01;

      let isAlpa = false, isIzin = false;
      if (pat === "perfect") { isAlpa = false; isIzin = false; }
      else if (pat === "good")    { isAlpa = day % 60 === 0; isIzin = day % 35 === 0; }
      else if (pat === "mixed")   { isAlpa = day % 20 === 0; isIzin = day % 13 === 0; }
      else if (pat === "problem") { isAlpa = day % 10 === 0; isIzin = day % 15 === 0; }
      else if (pat === "heavy")   { isAlpa = day % 5 === 0;  isIzin = day % 8 === 0; }

      const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;

      if (isAlpa) {
        await run(
          `INSERT OR IGNORE INTO attendances
            (user_id,date,day_idx,week_idx,shift_key,status,check_in,check_out,
             check_in_lat,check_in_lng,check_out_lat,check_out_lng,late_mins,early_mins,overtime_mins,note)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [emp.id, dateStr, dayIdx, weekIdx, shiftKey, "alpa", null, null, null, null, null, null, 0, 0, 0, "Alpha - tidak hadir"]
        );
        attCount++;
        continue;
      }
      if (isIzin) {
        await run(
          `INSERT OR IGNORE INTO attendances
            (user_id,date,day_idx,week_idx,shift_key,status,check_in,check_out,
             check_in_lat,check_in_lng,check_out_lat,check_out_lng,late_mins,early_mins,overtime_mins,note)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [emp.id, dateStr, dayIdx, weekIdx, shiftKey, "izin", null, null, null, null, null, null, 0, 0, 0, "Izin sakit"]
        );
        attCount++;
        continue;
      }

      let lateMins = 0;
      if (pat !== "perfect") {
        if (pat === "good"    && day % 18 === 0) lateMins = 5 + Math.floor(pseudoRand() * 40);
        if (pat === "mixed"   && day % 10 === 0) lateMins = 10 + Math.floor(pseudoRand() * 35);
        if (pat === "problem" && day % 5 === 0)  lateMins = 15 + Math.floor(pseudoRand() * 30);
        if (pat === "heavy"   && day % 4 === 0)  lateMins = 20 + Math.floor(pseudoRand() * 25);
      }

      const ciTotal = (sh + sm / 60) * 60 + lateMins;
      const checkIn = `${String(Math.floor(ciTotal / 60)).padStart(2, "0")}:${String(Math.round(ciTotal % 60)).padStart(2, "0")}`;

      let otMins = 0;
      if (pat !== "problem" && pat !== "heavy" && day % 7 === 0) otMins = 30 + Math.floor(pseudoRand() * 90);
      let earlyMins = 0;
      if ((pat === "mixed" || pat === "problem") && day % 11 === 0) earlyMins = 15 + Math.floor(pseudoRand() * 45);

      let checkOut = null;
      if (otMins > 0) {
        const coTotal = (eh + em / 60) * 60 + otMins;
        checkOut = `${String(Math.floor(coTotal / 60)).padStart(2, "0")}:${String(Math.round(coTotal % 60)).padStart(2, "0")}`;
      } else if (earlyMins > 0) {
        const coTotal = (eh + em / 60) * 60 - earlyMins;
        checkOut = `${String(Math.floor(coTotal / 60)).padStart(2, "0")}:${String(Math.round(Math.abs(coTotal % 60))).padStart(2, "0")}`;
      } else {
        checkOut = shiftEndStr;
      }

      let note = "";
      if (lateMins > 15) note = `Terlambat ${lateMins} menit`;
      else if (otMins > 0) note = `Lembur ${otMins} menit`;

      const ciLat = -6.21 + pseudoRand() * 0.01;
      const ciLng = 106.82 + pseudoRand() * 0.01;
      const coLat = -6.21 + pseudoRand() * 0.01;
      const coLng = 106.82 + pseudoRand() * 0.01;

      await run(
        `INSERT OR IGNORE INTO attendances
          (user_id,date,day_idx,week_idx,shift_key,status,check_in,check_out,
           check_in_lat,check_in_lng,check_out_lat,check_out_lng,late_mins,early_mins,overtime_mins,note)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [emp.id, dateStr, dayIdx, weekIdx, shiftKey, "hadir", checkIn, checkOut, ciLat, ciLng, coLat, coLng, lateMins, earlyMins, otMins, note]
      );
      attCount++;
    }
  }
  console.log(`    (${attCount} attendance rows)`);

  // ── KASBON ──
  console.log("  · Seed kasbon...");
  const kasbonData = [
    { userId: "e1", amount: 300000, note: "Kasbon darurat", status: "aktif" },
    { userId: "e3", amount: 200000, note: "Keperluan keluarga", status: "aktif" },
    { userId: "e5", amount: 150000, note: "Biaya rumah sakit", status: "aktif" },
  ];
  for (const k of kasbonData) {
    const exists = await get("SELECT id FROM kasbon WHERE user_id=? AND note=?", [k.userId, k.note]);
    if (!exists) {
      await run("INSERT INTO kasbon (user_id,amount,date,note,status) VALUES (?,?,?,?,?)", [k.userId, k.amount, today, k.note, k.status]);
    }
  }

  // ── ADJUSTMENTS ──
  console.log("  · Seed adjustments...");
  const adjData = [
    { userId: "e2", type: "tambah", amount: 50000, note: "Apresiasi karyawan terbaik" },
    { userId: "e4", type: "potong", amount: 25000, note: "Pecah gelas 2x" },
    { userId: "e7", type: "tambah", amount: 100000, note: "Lembur event khusus" },
  ];
  for (const a of adjData) {
    const exists = await get("SELECT id FROM adjustments WHERE user_id=? AND note=?", [a.userId, a.note]);
    if (!exists) {
      await run("INSERT INTO adjustments (user_id,type,amount,date,note,created_by) VALUES (?,?,?,?,?,?)", [a.userId, a.type, a.amount, today, a.note, "sa1"]);
    }
  }

  // ── Verify counts ──
  const counts = {
    outlets: (await all("SELECT COUNT(*) AS c FROM outlets"))[0].c,
    users: (await all("SELECT COUNT(*) AS c FROM users"))[0].c,
    schedules: (await all("SELECT COUNT(*) AS c FROM schedules"))[0].c,
    attendances: (await all("SELECT COUNT(*) AS c FROM attendances"))[0].c,
    kasbon: (await all("SELECT COUNT(*) AS c FROM kasbon"))[0].c,
    adjustments: (await all("SELECT COUNT(*) AS c FROM adjustments"))[0].c,
  };

  console.log("\nSeeding selesai.");
  console.log("Ringkasan:", counts);
  console.log("\nAkun demo (PIN plaintext):");
  console.log("  Super Admin   : sa1 / 000001");
  console.log("  Manager       : m1/900001  m2/900002  m3/900003");
  console.log("  Karyawan      : e1/100001  e17/200001  e33/300001");
}

try {
  await seed();
} catch (e) {
  console.error("\nGAGAL:", e.message);
  process.exit(1);
} finally {
  client.close();
}
