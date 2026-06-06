// scripts/seed-libsql.js
// Seed data untuk Turso/libSQL (production)
// Usage: DATABASE_URL="libsql://xxx" DATABASE_AUTH_TOKEN="xxx" node scripts/seed-libsql.js

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || (!url.startsWith("libsql://") && !url.startsWith("https://"))) {
  console.error("DATABASE_URL harus libsql:// atau https:// (Turso)");
  process.exit(1);
}

const client = createClient({ url, authToken });

const OUTLETS = [
  { id: "o1", name: "Outlet Sudirman", address: "Jl. Sudirman No. 1, Jakarta", lat: -6.2088, lng: 106.8456, radius: 50 },
  { id: "o2", name: "Outlet Senayan", address: "Jl. Asia Afrika No. 8, Jakarta", lat: -6.2256, lng: 106.7994, radius: 50 },
  { id: "o3", name: "Outlet Kemang", address: "Jl. Kemang Raya No. 17, Jakarta", lat: -6.2615, lng: 106.8137, radius: 50 },
];

const USERS = [
  // Outlet Sudirman (o1)
  { id: "e1",  name: "Andi Saputra",   outlet_id: "o1", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "100001" },
  { id: "e2",  name: "Budi Hartono",   outlet_id: "o1", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "100002" },
  { id: "e3",  name: "Citra Dewi",     outlet_id: "o1", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "100003" },
  { id: "e4",  name: "Dewi Anggraini", outlet_id: "o1", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "100004" },
  { id: "e5",  name: "Eko Prasetyo",   outlet_id: "o1", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "100105" },
  { id: "e6",  name: "Fitri Handayani",outlet_id: "o1", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "100106" },
  { id: "e7",  name: "Galih Wicaksono",outlet_id: "o1", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "100107" },
  { id: "e8",  name: "Hana Kusuma",    outlet_id: "o1", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "100108" },
  { id: "e9",  name: "Indra Permana",  outlet_id: "o1", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "100109" },
  { id: "e10", name: "Jeni Rahayu",    outlet_id: "o1", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "100110" },
  { id: "e11", name: "Kevin Santoso",  outlet_id: "o1", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "100111" },
  { id: "e12", name: "Lina Agustina",  outlet_id: "o1", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "100112" },
  { id: "e13", name: "Miko Hendra",    outlet_id: "o1", dept: "Security", gaji: 3100000, role: "karyawan", pin: "100113" },
  { id: "e14", name: "Nanda Irawan",   outlet_id: "o1", dept: "Security", gaji: 3100000, role: "karyawan", pin: "100114" },
  { id: "e15", name: "Omar Fauzi",     outlet_id: "o1", dept: "Security", gaji: 3100000, role: "karyawan", pin: "100115" },
  { id: "e16", name: "Puja Wulandari", outlet_id: "o1", dept: "Security", gaji: 3100000, role: "karyawan", pin: "100116" },
  // Outlet Senayan (o2)
  { id: "e17", name: "Raka Aditya",    outlet_id: "o2", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "200001" },
  { id: "e18", name: "Sari Maharani",  outlet_id: "o2", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "200002" },
  { id: "e19", name: "Toni Susanto",   outlet_id: "o2", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "200003" },
  { id: "e20", name: "Umi Kalsum",     outlet_id: "o2", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "200004" },
  { id: "e21", name: "Vino Wirawan",   outlet_id: "o2", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "200005" },
  { id: "e22", name: "Wati Lestari",   outlet_id: "o2", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "200006" },
  { id: "e23", name: "Xena Putri",     outlet_id: "o2", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "200007" },
  { id: "e24", name: "Yogi Pratama",   outlet_id: "o2", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "200008" },
  { id: "e25", name: "Zara Novita",    outlet_id: "o2", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "200009" },
  { id: "e26", name: "Arif Budiman",   outlet_id: "o2", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "200010" },
  { id: "e27", name: "Bella Safitri",  outlet_id: "o2", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "200011" },
  { id: "e28", name: "Candra Wijaya",  outlet_id: "o2", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "200012" },
  { id: "e29", name: "Dian Pramesti",  outlet_id: "o2", dept: "Security", gaji: 3100000, role: "karyawan", pin: "200013" },
  { id: "e30", name: "Edo Kurniawan",  outlet_id: "o2", dept: "Security", gaji: 3100000, role: "karyawan", pin: "200014" },
  { id: "e31", name: "Fara Claudia",   outlet_id: "o2", dept: "Security", gaji: 3100000, role: "karyawan", pin: "200015" },
  { id: "e32", name: "Gilang Ramadhan",outlet_id: "o2", dept: "Security", gaji: 3100000, role: "karyawan", pin: "200016" },
  // Outlet Kemang (o3)
  { id: "e33", name: "Hesti Wulandari",outlet_id: "o3", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "300001" },
  { id: "e34", name: "Irfan Maulana",  outlet_id: "o3", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "300002" },
  { id: "e35", name: "Jasmine Aulia",  outlet_id: "o3", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "300003" },
  { id: "e36", name: "Krisna Bayu",    outlet_id: "o3", dept: "Outlet",   gaji: 3200000, role: "karyawan", pin: "300004" },
  { id: "e37", name: "Luki Setiawan",  outlet_id: "o3", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "300005" },
  { id: "e38", name: "Mela Puspita",   outlet_id: "o3", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "300006" },
  { id: "e39", name: "Niko Pranata",   outlet_id: "o3", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "300039" },
  { id: "e40", name: "Okta Fitriani",  outlet_id: "o3", dept: "Kitchen",  gaji: 3500000, role: "karyawan", pin: "300040" },
  { id: "e41", name: "Panji Nugroho",  outlet_id: "o3", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "300041" },
  { id: "e42", name: "Qori Amelia",    outlet_id: "o3", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "300042" },
  { id: "e43", name: "Rizky Firmansyah",outlet_id:"o3", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "300043" },
  { id: "e44", name: "Sinta Larasati", outlet_id: "o3", dept: "Kasir",    gaji: 3300000, role: "karyawan", pin: "300044" },
  { id: "e45", name: "Taufik Hidayat", outlet_id: "o3", dept: "Security", gaji: 3100000, role: "karyawan", pin: "300045" },
  { id: "e46", name: "Umar Said",      outlet_id: "o3", dept: "Security", gaji: 3100000, role: "karyawan", pin: "300046" },
  { id: "e47", name: "Vera Susanti",   outlet_id: "o3", dept: "Security", gaji: 3100000, role: "karyawan", pin: "300047" },
  { id: "e48", name: "Wahyu Nugroho",  outlet_id: "o3", dept: "Security", gaji: 3100000, role: "karyawan", pin: "300048" },
  // Manager
  { id: "m1",  name: "Sari Manajer",   outlet_id: "o1", dept: "Management", gaji: 7000000, role: "manager",   pin: "900001" },
  { id: "m2",  name: "Rudi Manajer",   outlet_id: "o2", dept: "Management", gaji: 7000000, role: "manager",   pin: "900002" },
  { id: "m3",  name: "Nina Manajer",   outlet_id: "o3", dept: "Management", gaji: 7000000, role: "manager",   pin: "900003" },
  // Superadmin
  { id: "sa1", name: "Admin Super",    outlet_id: "o1", dept: "HQ",         gaji: 12000000,role: "superadmin",pin: "000001" },
];

async function main() {
  console.log("Seeding ke", url);

  // Hapus data existing (jika ada) — urutan: hapus dari tabel anak dulu
  console.log("Membersihkan data lama...");
  for (const table of ["payroll_adjustments", "payrolls", "adjustments", "kasbon", "attendances", "schedules", "schedule_locks", "users", "outlets"]) {
    try { await client.execute(`DELETE FROM ${table}`); } catch (e) { /* table mungkin belum ada */ }
  }

  // Insert outlets
  for (const o of OUTLETS) {
    await client.execute({
      sql: "INSERT OR REPLACE INTO outlets (id, name, address, lat, lng, radius) VALUES (?,?,?,?,?,?)",
      args: [o.id, o.name, o.address, o.lat, o.lng, o.radius],
    });
  }
  console.log(`  ✓ ${OUTLETS.length} outlets`);

  // Insert users
  for (const u of USERS) {
    await client.execute({
      sql: "INSERT OR REPLACE INTO users (id, name, outlet_id, dept, gaji, role, pin, is_active) VALUES (?,?,?,?,?,?,?,1)",
      args: [u.id, u.name, u.outlet_id, u.dept, u.gaji, u.role, u.pin],
    });
  }
  console.log(`  ✓ ${USERS.length} users`);

  console.log("\nSeeding selesai!");
  console.log("\nLogin credentials:");
  console.log("   Super Admin    : PIN 000001");
  console.log("   Manager Sudirman : PIN 900001");
  console.log("   Manager Senayan  : PIN 900002");
  console.log("   Manager Kemang   : PIN 900003");
  console.log("   Karyawan e1  : PIN 100001 (Outlet Sudirman)");
  console.log("   Karyawan e17 : PIN 200001 (Outlet Senayan)");
  console.log("   Karyawan e33 : PIN 300001 (Outlet Kemang)");

  client.close();
}

main().catch(console.error);