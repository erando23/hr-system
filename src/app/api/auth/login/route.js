// src/app/api/auth/login/route.js

import { db } from "@/lib/db";
import { users, outlets, schedules, attendances, kasbon } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { verifyPin, ok, err } from "@/lib/utils";
import { autoFillAttendance } from "@/lib/autoFill";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { userId, pin } = await request.json();

    if (!userId || !pin || pin.length !== 6) {
      return err("ID karyawan dan PIN 6 digit diperlukan", 400);
    }

    // Cari user by ID
    const [matchedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!matchedUser || !matchedUser.isActive) {
      return err("Akun tidak ditemukan", 404);
    }

    // Verifikasi PIN
    const match = await verifyPin(pin, matchedUser.pin);
    if (!match) {
      return err("PIN salah", 401);
    }

    // Ambil data outlet
    let outletData = null;
    if (matchedUser.outletId) {
      const [outlet] = await db
        .select()
        .from(outlets)
        .where(eq(outlets.id, matchedUser.outletId));
      outletData = outlet || null;
    }

    // Ambil semua outlets
    const allOutlets = await db.select().from(outlets);

    // Ambil semua employees (users non-superadmin)
    const allEmployees = await db
      .select({
        id:       users.id,
        name:     users.name,
        outletId: users.outletId,
        dept:     users.dept,
        gaji:     users.gaji,
        role:     users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.isActive, 1));

    // Ambil jadwal bulan ini
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const userIds = allEmployees.filter(u => u.role === "karyawan").map(u => u.id);

    const allSchedules = userIds.length > 0
      ? await db.select().from(schedules).where(eq(schedules.month, monthKey))
      : [];

    // Ambil semua kasbon
    const allKasbon = userIds.length > 0
      ? await db.select().from(kasbon)
      : [];

    // Ambil semua attendances bulan ini (untuk semua karyawan)
    // Auto-fill missing past rows so payroll sees complete data
    try { await autoFillAttendance(monthKey); } catch (e) { console.error("autoFillAttendance error:", e); }
    const allAttendances = await db.select().from(attendances);

    // Simpan session
    const session = await getSession();
    session.user = {
      id:       matchedUser.id,
      name:     matchedUser.name,
      role:     matchedUser.role,
      outletId: matchedUser.outletId,
      dept:     matchedUser.dept,
      gaji:     matchedUser.gaji,
    };
    await session.save();

    return ok({
      user: {
        id:       matchedUser.id,
        name:     matchedUser.name,
        role:     matchedUser.role,
        outletId: matchedUser.outletId,
        dept:     matchedUser.dept,
        outlet:   outletData,
      },
      outlets: allOutlets.map(o => ({
        ...o,
        outletHours: o.outletHours ? JSON.parse(o.outletHours) : {},
      })),
      employees: allEmployees,
      schedules: allSchedules,
      kasbon: allKasbon,
      attendances: allAttendances,
      monthKey,
    });
  } catch (error) {
    console.error("Login error:", error);
    return err("Server error", 500);
  }
}
