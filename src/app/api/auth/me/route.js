// src/app/api/auth/me/route.js

import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { outlets, users, schedules, kasbon, attendances } from "@/lib/schema";
import { ok, err } from "@/lib/utils";
import { autoFillAttendance } from "@/lib/autoFill";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return err("Belum login", 401);

  let outletData = null;
  if (user.outletId) {
    const [o] = await db.select().from(outlets).where(eq(outlets.id, user.outletId)).limit(1);
    outletData = o || null;
  }

  const allOutlets = await db.select().from(outlets);
  const allEmployees = await db.select().from(users).where(eq(users.isActive, 1));
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const kIds = allEmployees.filter(u => u.role === "karyawan").map(u => u.id);
  const allSchedules = kIds.length > 0 ? await db.select().from(schedules).where(eq(schedules.month, monthKey)) : [];
  const allKasbon = kIds.length > 0 ? await db.select().from(kasbon) : [];
  const allAttendances = await db.select().from(attendances);

  // Auto-fill missing past attendance rows so payroll has complete data
  try { await autoFillAttendance(monthKey); } catch (e) { console.error("autoFillAttendance error:", e); }
  const allAttendancesFilled = await db.select().from(attendances);

  return ok({
    user: { id: user.id, name: user.name, role: user.role, outletId: user.outletId, dept: user.dept, outlet: outletData || null },
    outlets: allOutlets.map(o => ({ ...o, outletHours: o.outletHours ? JSON.parse(o.outletHours) : {} })),
    employees: allEmployees,
    schedules: allSchedules,
    kasbon: allKasbon,
    attendances: allAttendancesFilled,
    monthKey,
  });
}
