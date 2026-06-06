// src/lib/schema.js
// Drizzle ORM schema — mendefinisikan semua tabel database

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ── OUTLETS ──────────────────────────────────────────────
export const outlets = sqliteTable("outlets", {
  id:      text("id").primaryKey(),          // e.g. "o1"
  name:    text("name").notNull(),           // "Outlet Sudirman"
  address: text("address").notNull(),
  lat:     real("lat").notNull(),            // koordinat GPS
  lng:     real("lng").notNull(),
  radius:  integer("radius").default(50),   // radius absensi dalam meter
  isSingleShift: integer("is_single_shift", { mode: "boolean" }).default(false),
  outletHours: text("outlet_hours"),          // JSON string: {shiftStart, shiftEnd, shift1Start, ...}
  // Off day for single-shift outlets (0=Mon..6=Sun, null=no fixed off day)
  offDay:  integer("off_day").default(null),
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ── SCHEDULE LOCKS (per outlet per month) ─────────────────
export const scheduleLocks = sqliteTable("schedule_locks", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  outletId:  text("outlet_id").notNull().references(() => outlets.id),
  month:     text("month").notNull(),        // "2026-05"
  isLocked:  integer("is_locked", { mode: "boolean" }).default(false),
  lockedBy:  text("locked_by"),             // userId yang mengunci
  lockedAt:  text("locked_at"),            // ISO timestamp
  updatedBy: text("updated_by"),           // userId yang terakhir update jadwal
  updatedAt: text("updated_at"),
});

// ── USERS (karyawan, manager, superadmin) ────────────────
export const users = sqliteTable("users", {
  id:       text("id").primaryKey(),
  name:     text("name").notNull(),
  outletId: text("outlet_id").references(() => outlets.id),
  dept:     text("dept").notNull(),
  gaji:     integer("gaji").notNull().default(0),   // gaji pokok per bulan
  role:     text("role").notNull(),                 // "karyawan"|"manager"|"superadmin"
  pin:      text("pin").notNull(),                  // hashed PIN (bcrypt)
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ── SCHEDULES ─────────────────────────────────────────────
// Setiap baris = 1 hari kerja untuk 1 karyawan di 1 minggu
export const schedules = sqliteTable("schedules", {
  id:       integer("id").primaryKey({ autoIncrement: true }),
  userId:   text("user_id").notNull().references(() => users.id),
  weekIdx:  integer("week_idx").notNull(),   // 0-3 (minggu ke berapa dalam bulan)
  dayIdx:   integer("day_idx").notNull(),   // 0=Sen, 1=Sel, ..., 6=Min (weekday)
  dayNum:   integer("day_num").notNull(),   // 1-31 (hari ke berapa dalam bulan)
  month:    text("month").notNull(),        // format "2026-05"
  shiftKey: text("shift_key").notNull(),   // "P"|"S"|"M"|"L"
});

// ── ATTENDANCES ───────────────────────────────────────────
export const attendances = sqliteTable("attendances", {
  id:           integer("id").primaryKey({ autoIncrement: true }),
  userId:       text("user_id").notNull().references(() => users.id),
  date:         text("date").notNull(),          // "2026-05-11"
  dayIdx:       integer("day_idx").notNull(),
  weekIdx:      integer("week_idx").notNull(),
  shiftKey:     text("shift_key").notNull(),
  status:       text("status").notNull(),        // "hadir"|"libur"|"izin"|"alpa"|"belum"
  checkIn:      text("check_in"),                // "08:05"
  checkOut:     text("check_out"),
  checkInLat:   real("check_in_lat"),            // koordinat GPS saat check-in
  checkInLng:   real("check_in_lng"),
  checkOutLat:  real("check_out_lat"),
  checkOutLng:  real("check_out_lng"),
  lateMins:     integer("late_mins").default(0),
  earlyMins:    integer("early_mins").default(0),
  overtimeMins: integer("overtime_mins").default(0),
  overtimeCount: integer("overtime_count").default(0),  // Per-kejadian (0/1) untuk ganti shift, bukan per menit
  lateWithPermission: integer("late_with_permission", { mode: "boolean" }).default(false),
  earlyLeaveCount: integer("early_leave_count").default(0),
  note:         text("note").default(""),
  overrideBy:   text("override_by"),             // userId manager yg override
  overrideType: text("override_type"),           // "terlambat_izin"|"ganti_shift"|"izin"|"alpa"|"pulang_tidak_sesuai"
  keterangan:   text("keterangan"),              // "peringatan ke-1"|"peringatan ke-2"|"terlambat"
  createdAt:    text("created_at").default(new Date().toISOString()),
});

// ── KASBON ────────────────────────────────────────────────
export const kasbon = sqliteTable("kasbon", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  userId:    text("user_id").notNull().references(() => users.id),
  amount:    integer("amount").notNull(),
  date:      text("date").notNull(),
  note:      text("note").default(""),
  status:    text("status").notNull().default("pending"), // "pending"|"aktif"|"lunas"|"ditolak"
  approvedBy: text("approved_by"),                        // userId manager
  rejectNote: text("reject_note"),                        // alasan penolakan
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ── ADJUSTMENTS (penyesuaian gaji manual) ────────────────
export const adjustments = sqliteTable("adjustments", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  userId:    text("user_id").notNull().references(() => users.id),
  type:      text("type").notNull(),      // "tambah"|"potong"
  amount:    integer("amount").notNull(),
  date:      text("date").notNull(),
  note:      text("note").default(""),
  createdBy: text("created_by").notNull(), // userId superadmin
  createdAt: text("created_at").default(new Date().toISOString()),
  // Non-null when this adjustment has been copied into a published payroll.
  // When set, the payroll row is the source of truth — the adjustment is hidden
  // from re-calculation but kept for audit. Set back to null to "unapply".
  appliedToPayrollId: integer("applied_to_payroll_id").references(() => payrolls.id),
  appliedAt:         text("applied_at"),
});

// ── PAYROLL RECORDS ───────────────────────────────────────
export const payrolls = sqliteTable("payrolls", {
  id:                integer("id").primaryKey({ autoIncrement: true }),
  userId:            text("user_id").notNull().references(() => users.id),
  month:             text("month").notNull(),          // "2026-05"
  gajiPokok:         integer("gaji_pokok").notNull(),
  totalHadir:        integer("total_hadir").default(0),
  totalLate:         integer("total_late").default(0),
  totalLateMins:     integer("total_late_mins").default(0),
  totalAlpha:        integer("total_alpha").default(0),     // REVISI: hari alpha
  totalOvertimeCount: integer("total_overtime_count").default(0), // Jumlah kejadian lembur (per-occurrence)
  plusLembur:         integer("plus_lembur").default(0),
  plusBonus:          integer("plus_bonus").default(0),
  potTerlambat:      integer("pot_terlambat").default(0),
  potEarlyLeave:      integer("pot_early_leave").default(0),
  potKasbon:          integer("pot_kasbon").default(0),
  potLainnya:         integer("pot_lainnya").default(0),
  gajiBersih:        integer("gaji_bersih").notNull(),
  // Breakdown detail strings (JSON) — saved so payslip can show sub-items
  detailLembur:      text("detail_lembur").default(""),     // JSON: [{qty,rate,subtotal}]
  detailBonus:       text("detail_bonus").default(""),      // JSON: [{note,amount}]
  detailKasbon:      text("detail_kasbon").default(""),     // JSON: [{note,date,amount}]
  detailPotongan:    text("detail_potongan").default(""),   // JSON: [{note,amount}]
  status:            text("status").default("draft"),        // "draft"|"approved"|"paid"
  generatedBy:        text("generated_by"),
  generatedAt:        text("generated_at"),
  paidAt:            text("paid_at"),
});

// ── PAYROLL DETAIL ITEMS (adjustment items stored per payroll) ──
// Adjustments from the adjustments table are copied here at publish time
// so they are preserved even if the adjustment record is deleted later
export const payrollAdjustments = sqliteTable("payroll_adjustments", {
  id:           integer("id").primaryKey({ autoIncrement: true }),
  payrollId:    integer("payroll_id").notNull().references(() => payrolls.id),
  adjType:      text("adj_type").notNull(),    // "tambah"|"potong"
  amount:       integer("amount").notNull(),
  note:         text("note").default(""),
  createdBy:    text("created_by"),
});
