// src/lib/utils.js
// Fungsi utilitas yang dipakai di seluruh aplikasi

// ── Format rupiah ──────────────────────────────────────────
export const formatRp = (n) =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(Math.abs(n ?? 0)));

// ── Format durasi menit ────────────────────────────────────
export function formatMins(mins) {
  if (!mins || mins === 0) return "—";
  if (mins < 60) return `${mins} mnt`;
  return `${Math.floor(mins / 60)}j ${mins % 60}m`;
}

// ── Haversine distance (meter) ─────────────────────────────
export function calcDist(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Tanggal ────────────────────────────────────────────────
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function monthStr(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getDayAndWeek(date = new Date()) {
  const jsDay = date.getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6
  const weekIdx = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
  return { dayIdx, weekIdx };
}

// ── PIN (stored as plaintext string — 4 or 6 digits) ───────
export function verifyPin(pin, storedPin) {
  return pin === storedPin;
}

// ── Response helpers ───────────────────────────────────────
export function ok(data, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function err(message, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// ── Payroll calculation ────────────────────────────────────
// Tarif per departemen (per ×-incident)
export const TARIF_LEMBUR = { Outlet: 25000, Kasir: 25000, Kitchen: 35000, Security: 25000 };
export const TARIF_TERLAMBAT = 10000;   // Rp per kejadian (>15 mnt) - flat rate
export const TARIF_ALPHA = { Outlet: 50000, Kasir: 50000, Kitchen: 75000, Security: 50000 }; // Deduction per alpha/izin day
export const TARIF_EARLY_MENIT = 500;   // Rp per menit pulang cepat tanpa izin
export const TARIF_LEMBUR_JAM = 15000;  // fallback Rp per jam lembur (generic)

export function getTarifLembur(dept) {
  return TARIF_LEMBUR[dept] || 25000;
}

export function getTarifAlpha(dept) {
  return TARIF_ALPHA[dept] || 50000;
}

export function calculatePayroll(user, attendanceRows, kasbonRows, adjustmentRows, dept = "Outlet") {
  const hadirRows = attendanceRows.filter((a) => a.status === "hadir" || a.status === "terlambat");
  const alphaRows = attendanceRows.filter((a) => a.status === "alpa");
  const izinRows = attendanceRows.filter((a) => a.status === "izin");

  // Count late permission overrides (max 2x allowed without penalty)
  const latePermissionRows = attendanceRows.filter((a) => a.overrideType === "terlambat_izin");
  const latePermissionCount = latePermissionRows.length;

  // Count how many are over the 2x limit (those with keterangan = "terlambat")
  const latePermissionOverLimit = latePermissionRows.filter((a) => a.keterangan === "terlambat").length;

  const totalHadir = hadirRows.length;
  // Count actual late (not with permission, or over the 2x limit)
  const totalLate = hadirRows.filter((a) =>
    (a.lateMins > 15 && !a.lateWithPermission) || a.status === "terlambat" || a.keterangan === "terlambat"
  ).length;
  const totalLateMins = hadirRows.reduce((s, a) => s + (a.lateMins || 0), 0);
  // Overtime dihitung per kejadian (occurrence), bukan per menit
  const totalOvertimeCount = hadirRows.reduce((s, a) => s + (a.overtimeCount || 0), 0);
  const totalEarlyMins = hadirRows.reduce((s, a) => s + (a.earlyMins || 0), 0);
  const totalAlpha = alphaRows.length;

  // Early leave count: counted per incident
  const earlyLeaveCount = hadirRows.reduce((s, a) => s + (a.earlyLeaveCount || 0), 0);
  const tarifOT = getTarifLembur(dept);
  const potEarlyLeave = earlyLeaveCount * tarifOT;

  // Total days paid: they get 1 day's pay for every hadir/terlambat status
  const effectiveLatePermission = Math.min(latePermissionCount, 2);
  const totalDaysPaid = totalHadir + effectiveLatePermission - latePermissionOverLimit;

  // Lembur calculation - per kejadian (occurrence) dengan tarif departemen
  const tarifLemburPerKejadian = tarifOT; // Using dept-specific overtime rate
  const plusLembur = totalOvertimeCount * tarifLemburPerKejadian;

  // Bonus (tambah)
  const bonusRows = adjustmentRows.filter((a) => a.type === "tambah");
  const plusBonus = bonusRows.reduce((s, a) => s + a.amount, 0);

  // Potongan terlambat: flat rate per kejadian
  const potTerlambat = totalLate * TARIF_TERLAMBAT;

  // Potongan alpha + izin: department-specific rate per day
  const tarifAlpha = getTarifAlpha(dept);
  const potAlphaIzin = (alphaRows.length + izinRows.length) * tarifAlpha;

  // Kasbon aktif
  const activeKasbon = kasbonRows.filter((k) => k.status === "aktif");
  const potKasbon = activeKasbon.reduce((s, k) => s + k.amount, 0);

  // Potongan lain (adjustments potong)
  const potongRows = adjustmentRows.filter((a) => a.type === "potong");
  const potLainnya = potongRows.reduce((s, a) => s + a.amount, 0);

  // Gaji pokok diprorate: (gaji / 30) × hari kerja (hadir + late izin tanpa potongan)
  const gajiPokok = Math.round((user.gaji / 30) * totalDaysPaid);

  const totalPendapatan = gajiPokok + plusLembur + plusBonus;
  const totalPotongan = potTerlambat + potEarlyLeave + potAlphaIzin + potKasbon + potLainnya;
  const gajiBersih = totalPendapatan - totalPotongan;

  // Build detail items for payslip
  const alphaIzinDetail = [
    ...(alphaRows.map(a => ({ note: `Alpa - ${a.date}`, amount: tarifAlpha }))),
    ...(izinRows.map(a => ({ note: `Izin - ${a.date}`, amount: tarifAlpha }))),
  ];

  return {
    // Core fields
    gajiPokok,
    totalHadir,
    totalLate,
    totalLateMins,
    totalAlpha,
    totalOvertimeCount,  // Changed from totalOvertimeMins
    latePermissionCount,
    earlyLeaveCount,
    totalIzin: izinRows.length,
    // Income breakdown
    plusLembur,
    plusBonus,
    // Deductions breakdown
    potTerlambat,
    potEarlyLeave,
    potAlphaIzin,
    potKasbon,
    potLainnya,
    // Totals
    totalPendapatan,
    totalPotongan,
    gajiBersih,
    // Detail sub-items (for payslip display)
    bonusDetail: bonusRows.map(a => ({ note: a.note || "Bonus", amount: a.amount })),
    kasbonDetail: activeKasbon.map(k => ({ note: k.note || "Kasbon", date: k.date, amount: k.amount })),
    potongDetail: potongRows.map(a => ({ note: a.note || "Potongan", amount: a.amount })),
    lemburDetail: totalOvertimeCount > 0 ? [{ count: totalOvertimeCount, rate: tarifLemburPerKejadian, subtotal: plusLembur }] : [],
    alphaIzinDetail,
  };
}
