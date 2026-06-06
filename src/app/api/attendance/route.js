// src/app/api/attendance/route.js

import { db } from "@/lib/db";
import { attendances, schedules, outlets, users } from "@/lib/schema";
import { requireAuth } from "@/lib/session";
import { ok, err, calcDist, todayStr, getDayAndWeek } from "@/lib/utils";
import { eq, and, like } from "drizzle-orm";

// GET — ambil absensi user saat ini (bulan ini)
export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const userId  = searchParams.get("userId") || user.id;
    const month   = searchParams.get("month") || "";

    // Hanya manager/superadmin yang bisa lihat user lain
    if (userId !== user.id && !["manager","superadmin"].includes(user.role)) {
      return err("Tidak diizinkan", 403);
    }

    let query = db.select().from(attendances).where(eq(attendances.userId, userId));
    const rows = await query;

    const filtered = month
      ? rows.filter(r => r.date.startsWith(month))
      : rows;

    return ok(filtered.sort((a, b) => b.date.localeCompare(a.date)));
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error: " + e.message, 500);
  }
}

// POST — check-in, check-out, or manual attendance record
export async function POST(request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { action, lat, lng, empId, date, status, shiftKey: bodyShiftKey, note } = body;

    // ── Manual attendance record (for manager override — create alpa/izin record) ──
    if (action === "manual") {
      if (!["manager","superadmin"].includes(user.role)) {
        return err("Hanya manager/superadmin yang bisa membuat record manual", 403);
      }
      if (!empId || !date || !status) return err("empId, date, status diperlukan", 400);

      const now = new Date(date);
      const { dayIdx, weekIdx } = getDayAndWeek(now);
      const actualShiftKey = bodyShiftKey || "P";

      // Cek existing
      const [existing] = await db
        .select()
        .from(attendances)
        .where(and(eq(attendances.userId, empId), eq(attendances.date, date)));

      if (existing) {
        await db.update(attendances)
          .set({ status, shiftKey: actualShiftKey, note: note || existing.note, overrideBy: user.id, checkIn: null, checkOut: null })
          .where(eq(attendances.id, existing.id));
        return ok({ message: "Record absensi diupdate", id: existing.id });
      } else {
        const [newRow] = await db.insert(attendances).values({
          userId: empId, date, dayIdx, weekIdx, shiftKey: actualShiftKey,
          status, checkIn: null, checkOut: null,
          lateMins: 0, earlyMins: 0, overtimeMins: 0,
          lateWithPermission: false, earlyLeaveCount: 0,
          note: note || "",
        }).returning();
        return ok({ message: "Record absensi dibuat", id: newRow.id }, 201);
      }
    }

    if (!["checkin","checkout"].includes(action)) {
      return err("Action tidak valid", 400);
    }
    if (lat === undefined || lng === undefined) {
      return err("Koordinat GPS diperlukan", 400);
    }

    // Ambil outlet user untuk validasi jarak
    const [outlet] = await db
      .select()
      .from(outlets)
      .where(eq(outlets.id, user.outletId));

    if (!outlet) return err("Outlet tidak ditemukan", 404);

    // Hitung jarak
    const dist = calcDist(lat, lng, outlet.lat, outlet.lng);
    const radius = outlet.radius || 50;

    if (dist > radius) {
      return err(
        `Anda berada ${Math.round(dist)}m dari outlet. Harus dalam radius ${radius}m.`,
        400
      );
    }

    const today    = todayStr();
    const nowDate  = new Date();
    const nowTime  = `${String(nowDate.getHours()).padStart(2,"0")}:${String(nowDate.getMinutes()).padStart(2,"0")}`;
    const nowMins  = nowDate.getHours() * 60 + nowDate.getMinutes();
    const { dayIdx, weekIdx } = getDayAndWeek(nowDate);

    // Cari record absensi hari ini
    const [existing] = await db
      .select()
      .from(attendances)
      .where(and(eq(attendances.userId, user.id), eq(attendances.date, today)));

    // Ambil jadwal shift hari ini — lookup by dayNum
    const nowDate2 = new Date();
    const monthStr = `${nowDate2.getFullYear()}-${String(nowDate2.getMonth()+1).padStart(2,"0")}`;
    const dayNum = nowDate2.getDate();
    const [sched] = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.userId, user.id),
          eq(schedules.dayNum, dayNum),
          eq(schedules.month, monthStr)
        )
      );

    const shiftKey = sched?.shiftKey ?? "L";

    if (shiftKey === "L") {
      return err("Hari ini adalah hari libur Anda", 400);
    }

    if (action === "checkin") {
      if (existing?.checkIn) {
        return err("Anda sudah check-in hari ini", 400);
      }

      // Hitung keterlambatan
      const shiftStartStr = { P:"07:00", S:"11:00", M:"15:00" }[shiftKey];
      const [sh, sm] = shiftStartStr.split(":").map(Number);
      const shiftStartMins = sh * 60 + sm;
      const lateMins = Math.max(0, nowMins - shiftStartMins);

      if (existing) {
        await db.update(attendances)
          .set({ status:"hadir", checkIn:nowTime, checkInLat:lat, checkInLng:lng, lateMins })
          .where(eq(attendances.id, existing.id));
      } else {
        await db.insert(attendances).values({
          userId: user.id, date: today, dayIdx, weekIdx, shiftKey,
          status:"hadir", checkIn:nowTime, checkInLat:lat, checkInLng:lng,
          lateMins, earlyMins:0, overtimeMins:0,
          lateWithPermission: false, earlyLeaveCount: 0,
        });
      }

      return ok({
        time: nowTime,
        lateMins,
        isLate: lateMins > 15,
        message: lateMins > 15
          ? `Check-in berhasil. Anda terlambat ${lateMins} menit.`
          : "Check-in berhasil. Tepat waktu!",
      });
    }

    // checkout
    if (!existing?.checkIn) {
      return err("Anda belum check-in hari ini", 400);
    }
    if (existing?.checkOut) {
      return err("Anda sudah check-out hari ini", 400);
    }

    const shiftEndStr = { P:"15:00", S:"19:00", M:"23:00" }[shiftKey];
    const [eh, em] = shiftEndStr.split(":").map(Number);
    const shiftEndMins = eh * 60 + em;
    const earlyMins    = Math.max(0, shiftEndMins - nowMins);

    // Overtime/lembur hanya bisa diberikan oleh manager/admin melalui override
    // Karyawan tidak mendapat overtime otomatis meskipun checkout terlambat
    await db.update(attendances)
      .set({ checkOut: nowTime, checkOutLat: lat, checkOutLng: lng, earlyMins })
      .where(eq(attendances.id, existing.id));

    return ok({
      time: nowTime,
      earlyMins,
      message: earlyMins > 0
        ? `Check-out berhasil. Pulang ${earlyMins} menit lebih awal.`
        : "Check-out berhasil!",
    });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    console.error(e);
    return err("Server error", 500);
  }
}

// PATCH — override absensi oleh manager/superadmin
export async function PATCH(request) {
  try {
    const user = await requireAuth();
    if (!["manager","superadmin"].includes(user.role)) {
      return err("Hanya manager/superadmin yang bisa override", 403);
    }

    const body = await request.json();
    const { attendanceId, overrideType, overrideNote } = body;

    if (!attendanceId) return err("attendanceId diperlukan", 400);

    // Get existing attendance record
    const [existing] = await db
      .select()
      .from(attendances)
      .where(eq(attendances.id, attendanceId));

    if (!existing) return err("Record absensi tidak ditemukan", 404);

    // Get user's attendance records for this month to count late permission
    const monthStr = existing.date.substring(0, 7); // "2026-06"
    const allAttendances = await db
      .select()
      .from(attendances)
      .where(
        and(
          eq(attendances.userId, existing.userId),
          like(attendances.date, `${monthStr}%`)
        )
      );

    const latePermissionCount = allAttendances.filter(
      a => a.overrideType === "terlambat_izin" && a.id !== existing.id
    ).length;

    let updates = {};
    let keterangan = null;

    switch (overrideType) {
      case "terlambat_izin":
        // Max 2x/month - if already 2, apply late deduction
        if (latePermissionCount >= 2) {
          updates.status = "terlambat"; // Status becomes terlambat if limit reached
          updates.lateMins = Math.max(existing.lateMins || 0, 16); // Force at least 16 mins to trigger >15 late penalty
          keterangan = "terlambat"; // Over 2x limit
        } else {
          updates.status = "hadir";
          updates.lateMins = 0; // No late penalty
          updates.lateWithPermission = true;
          keterangan = latePermissionCount === 0 ? "peringatan ke-1" : "peringatan ke-2";
        }
        break;

      case "ganti_shift":
        updates.status = "hadir";
        updates.overtimeCount = 1; // Per-kejadian, bukan per menit
        keterangan = "ganti shift teman";
        break;

      case "izin":
        updates.status = "izin";
        updates.checkIn = null;
        updates.checkOut = null;
        keterangan = "tidak masuk dengan izin";
        break;

      case "alpa":
        updates.status = "alpa";
        updates.checkIn = null;
        updates.checkOut = null;
        keterangan = "tanpa keterangan";
        break;

      case "pulang_tidak_sesuai":
        updates.status = "izin";
        updates.checkOut = null; // Clear checkout to indicate early/unplanned leave
        keterangan = "pulang tidak sesuai jadwal";
        break;

      default:
        return err("Tipe override tidak valid", 400);
    }

    // Apply updates
    await db.update(attendances)
      .set({
        ...updates,
        overrideType,
        keterangan,
        note: overrideNote || existing.note,
        overrideBy: user.id,
      })
      .where(eq(attendances.id, attendanceId));

    return ok({
      message: "Absensi berhasil diupdate",
      keterangan,
      status: updates.status || existing.status,
    });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Akses ditolak", 403);
    console.error("Override error:", e);
    return err("Server error", 500);
  }
}
