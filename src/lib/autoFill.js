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
function hasShiftEnded(shiftEnd, dateStr) {
  if (!shiftEnd) return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateStr < today) return true; // past date — always ended
  if (dateStr > today) return false; // future date — never ended
  // same day — compare HH:MM
  const [h, m] = String(shiftEnd).split(":").map(Number);
  if (Number.isNaN(h)) return true;
  const endMin = h * 60 + (m || 0);
  const nowMin = now.getHours() * 60 + now.getMinutes();
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

  const rowsToInsert = [];
  const nowIso = new Date().toISOString();
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

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
        userId: sched.userId,
        date: dateStr,
        dayIdx: sched.dayIdx,
        weekIdx: sched.weekIdx,
        shiftKey: "L",
        status: "hadir",
        checkIn: null,
        checkOut: null,
        checkInLat: null,
        checkInLng: null,
        checkOutLat: null,
        checkOutLng: null,
        lateMins: 0,
        earlyMins: 0,
        overtimeMins: 0,
        overtimeCount: 0,
        lateWithPermission: false,
        earlyLeaveCount: 0,
        note: "auto: libur terjadwal",
        overrideBy: null,
        createdAt: nowIso,
      });
      continue;
    }

    // Working shift — only auto-mark alpa after the shift has ended.
    if (!hasShiftEnded(times.end, dateStr)) continue;

    rowsToInsert.push({
      userId: sched.userId,
      date: dateStr,
      dayIdx: sched.dayIdx,
      weekIdx: sched.weekIdx,
      shiftKey: sched.shiftKey,
      status: "alpa",
      checkIn: null,
      checkOut: null,
      checkInLat: null,
      checkInLng: null,
      checkOutLat: null,
      checkOutLng: null,
      lateMins: 0,
      earlyMins: 0,
      overtimeMins: 0,
      overtimeCount: 0,
      lateWithPermission: false,
      earlyLeaveCount: 0,
      note: "auto: alpa (tidak absen)",
      overrideBy: null,
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
