// src/lib/autoFill.js
// Backfill missing attendance rows for past dates so payroll has full data.
// Called from auth endpoints so the SPA sees the same data without an extra
// round-trip.

import { db } from "@/lib/db";
import { attendances, schedules, outlets, users } from "@/lib/schema";
import { and, eq, lte, gte } from "drizzle-orm";

const SHIFT_END_DEFAULT = "21:00";
const SHIFT_START_DEFAULT = "07:00";

function getShiftTimes(shiftKey, outlet) {
  let h = outlet?.outletHours || {};
  if (typeof h === "string") {
    try { h = JSON.parse(h); } catch { h = {}; }
  }
  const sStart = h.shift1Start || h.shiftStart || SHIFT_START_DEFAULT;
  const sEnd = h.shift2End || h.shiftEnd || SHIFT_END_DEFAULT;
  if (shiftKey === "L") return { start: null, end: null };
  if (shiftKey === "FULL") return { start: sStart, end: sEnd };
  if (shiftKey === "P") return { start: h.shift1Start || sStart, end: h.shift1End || "14:00" };
  if (shiftKey === "S") return { start: h.shift2Start || "14:00", end: h.shift2End || sEnd };
  if (shiftKey === "M") return { start: h.shift1Start || "15:00", end: h.shift2End || sEnd };
  return { start: sStart, end: sEnd };
}

// Returns true when a shift has already ended in real-world time.
// Server-side time is interpreted in APP_TZ (Asia/Jakarta by default) so the
// Vercel UTC clock doesn't make late-evening shifts look unended.
const APP_TZ = process.env.APP_TZ || "Asia/Jakarta";

function nowInAppTz() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`,
    hours: parseInt(get("hour"), 10) % 24, // Intl can return "24" at midnight in some locales
    minutes: parseInt(get("minute"), 10),
  };
}

function hasShiftEnded(shiftEnd, dateStr) {
  if (!shiftEnd) return false;
  const { dateStr: today, hours, minutes } = nowInAppTz();
  if (dateStr < today) return true; // past date — always ended
  if (dateStr > today) return false; // future date — never ended
  // same day — compare HH:MM
  const [h, m] = String(shiftEnd).split(":").map(Number);
  if (Number.isNaN(h)) return true;
  const endMin = h * 60 + (m || 0);
  const nowMin = hours * 60 + minutes;
  return nowMin >= endMin;
}

// Auto-fill attendance for a single month ("YYYY-MM").
// Rules:
//  - L (off-day)  → status "hadir" with no check-in/out (paid off-day)
//  - P/S/M/FULL + shift has ended, no row yet → status "alpa"
// Already-recorded rows are never overwritten.
export async function autoFillAttendance(month) {
  if (!/^\d{4}-\d{2}$/.test(month || "")) return { filled: 0 };

  // bounds
  const [y, m] = month.split("-").map(Number);
  const firstOfMonth = `${month}-01`;
  // last day of month
  const lastOfMonth = new Date(y, m, 0).getDate();
  const lastDateStr = `${month}-${String(lastOfMonth).padStart(2, "0")}`;

  const allOutlets = await db.select().from(outlets);
  const outletById = Object.fromEntries(allOutlets.map((o) => [o.id, o]));

  const allUsers = await db
    .select({ id: users.id, outletId: users.outletId, isActive: users.isActive, role: users.role })
    .from(users)
    .where(eq(users.isActive, 1));

  const allSchedules = await db
    .select()
    .from(schedules)
    .where(eq(schedules.month, month));

  // group by (userId, date)
  const byUserDate = {};
  for (const s of allSchedules) {
    const dateStr = `${s.month}-${String(s.dayNum).padStart(2, "0")}`;
    byUserDate[`${s.userId}|${dateStr}`] = s;
  }

  const existing = await db
    .select({ userId: attendances.userId, date: attendances.date })
    .from(attendances)
    .where(and(gte(attendances.date, firstOfMonth), lte(attendances.date, lastDateStr)));
  const haveRow = new Set(existing.map((r) => `${r.userId}|${r.date}`));

  // Build the row shape that matches the seed (src/scripts/seed.js). We deliberately
  // omit overrideType/keterangan/overtimeCount/lateWithPermission/earlyLeaveCount
  // so the insert works against older Turso DBs that predate those ALTER TABLE
  // migrations — Drizzle won't try to send columns you don't set.
  const baseRow = {
    checkIn: null,
    checkOut: null,
    checkInLat: null,
    checkInLng: null,
    checkOutLat: null,
    checkOutLng: null,
    lateMins: 0,
    earlyMins: 0,
    overtimeMins: 0,
    note: "",
    overrideBy: null,
  };

  const rowsToInsert = [];
  const nowIso = new Date().toISOString();
  const todayStr = nowInAppTz().dateStr;

  const userOutletById = {};
  for (const u of allUsers) userOutletById[u.id] = outletById[u.outletId];

  for (const key of Object.keys(byUserDate)) {
    const sched = byUserDate[key];
    const dateStr = `${sched.month}-${String(sched.dayNum).padStart(2, "0")}`;
    if (dateStr > todayStr) continue; // future date — leave alone
    if (haveRow.has(`${sched.userId}|${dateStr}`)) continue; // already recorded

    const userOutlet = userOutletById[sched.userId];
    if (!userOutlet) continue;

    const times = getShiftTimes(sched.shiftKey, userOutlet);

    if (sched.shiftKey === "L") {
      // Off-day — backfill as "hadir" (treated as paid off-day by payroll)
      rowsToInsert.push({
        ...baseRow,
        userId: sched.userId,
        date: dateStr,
        dayIdx: sched.dayIdx,
        weekIdx: sched.weekIdx,
        shiftKey: "L",
        status: "hadir",
        note: "auto: libur terjadwal",
        createdAt: nowIso,
      });
      continue;
    }

    // Working shift — only auto-mark alpa after the shift has ended.
    if (!hasShiftEnded(times.end, dateStr)) continue;

    rowsToInsert.push({
      ...baseRow,
      userId: sched.userId,
      date: dateStr,
      dayIdx: sched.dayIdx,
      weekIdx: sched.weekIdx,
      shiftKey: sched.shiftKey,
      status: "alpa",
      note: "auto: alpa (tidak absen)",
      createdAt: nowIso,
    });
  }

  if (!rowsToInsert.length) return { filled: 0 };

  // Insert in chunks to avoid SQLite parameter limits
  const CHUNK = 50;
  let inserted = 0;
  for (let i = 0; i < rowsToInsert.length; i += CHUNK) {
    const chunk = rowsToInsert.slice(i, i + CHUNK);
    await db.insert(attendances).values(chunk);
    inserted += chunk.length;
  }
  return { filled: inserted, scanned: rowsToInsert.length };
}
