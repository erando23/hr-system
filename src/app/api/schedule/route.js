// src/app/api/schedule/route.js

import { db } from "@/lib/db";
import { schedules } from "@/lib/schema";
import { requireAuth } from "@/lib/session";
import { ok, err } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

// GET — ambil jadwal (user sendiri atau semua outlet untuk manager)
export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const userId  = searchParams.get("userId") || user.id;
    const month   = searchParams.get("month") || "";

    // Karyawan hanya bisa lihat jadwalnya sendiri
    if (userId !== user.id && !["manager","superadmin"].includes(user.role)) {
      return err("Akses ditolak", 403);
    }

    const rows = await db
      .select()
      .from(schedules)
      .where(
        month
          ? and(eq(schedules.userId, userId), eq(schedules.month, month))
          : eq(schedules.userId, userId)
      );

    // Ubah ke format nested: { weekIdx: { dayIdx: shiftKey } }
    const nested = {};
    for (const row of rows) {
      if (!nested[row.weekIdx]) nested[row.weekIdx] = {};
      nested[row.weekIdx][row.dayIdx] = row.shiftKey;
    }

    return ok({ raw: rows, nested });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}

// GET all for outlet (manager view)
export async function HEAD(request) {
  // Dipakai untuk check availability
  return new Response(null, { status: 200 });
}

// POST — set jadwal batch (manager)
export async function POST(request) {
  try {
    const user = await requireAuth();
    if (!["manager","superadmin"].includes(user.role)) {
      return err("Akses ditolak", 403);
    }

    const body = await request.json();
    // body.schedules = array of { userId, weekIdx, dayIdx, month, shiftKey }
    const { schedules: items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return err("Data jadwal tidak valid", 400);
    }

    // Upsert setiap item — unique by (userId, dayNum, month)
    for (const item of items) {
      const { userId, weekIdx, dayIdx, month, shiftKey, dayNum } = item;

      const [existing] = await db
        .select()
        .from(schedules)
        .where(
          and(
            eq(schedules.userId, userId),
            eq(schedules.dayNum, dayNum),
            eq(schedules.month, month)
          )
        );

      if (existing) {
        await db.update(schedules)
          .set({ shiftKey, weekIdx, dayIdx })
          .where(eq(schedules.id, existing.id));
      } else {
        await db.insert(schedules).values({ userId, weekIdx, dayIdx, dayNum, month, shiftKey });
      }
    }

    return ok({ message: `${items.length} jadwal berhasil disimpan` });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error: " + e.message, 500);
  }
}
