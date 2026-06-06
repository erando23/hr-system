// src/app/api/schedule-lock/route.js

import { db } from "@/lib/db";
import { scheduleLocks } from "@/lib/schema";
import { requireRole } from "@/lib/session";
import { ok, err } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

// GET — check lock status for outlet+month
export async function GET(request) {
  try {
    await requireRole("manager", "superadmin");
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get("outletId");
    const month = searchParams.get("month");

    if (!outletId || !month) return err("outletId dan month diperlukan", 400);

    const [lock] = await db.select().from(scheduleLocks)
      .where(and(eq(scheduleLocks.outletId, outletId), eq(scheduleLocks.month, month)));

    return ok({ isLocked: lock?.isLocked || false, lock: lock || null });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Akses ditolak", 403);
    return err("Server error", 500);
  }
}

// POST — lock/unlock schedule
export async function POST(request) {
  try {
    const user = await requireRole("manager", "superadmin");
    const { outletId, month, isLocked } = await request.json();

    if (!outletId || !month || isLocked === undefined) {
      return err("outletId, month, isLocked diperlukan", 400);
    }

    const now = new Date().toISOString();

    // Check existing
    const [existing] = await db.select().from(scheduleLocks)
      .where(and(eq(scheduleLocks.outletId, outletId), eq(scheduleLocks.month, month)));

    if (existing) {
      await db.update(scheduleLocks)
        .set({
          isLocked: isLocked ? 1 : 0,
          lockedBy: isLocked ? user.id : existing.lockedBy,
          lockedAt: isLocked ? now : existing.lockedAt,
          updatedBy: user.id,
          updatedAt: now,
        })
        .where(eq(scheduleLocks.id, existing.id));
    } else {
      await db.insert(scheduleLocks).values({
        outletId,
        month,
        isLocked: isLocked ? 1 : 0,
        lockedBy: isLocked ? user.id : null,
        lockedAt: isLocked ? now : null,
        updatedBy: user.id,
        updatedAt: now,
      });
    }

    return ok({ message: isLocked ? "Jadwal dikunci" : "Jadwal dibuka kembali" });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Akses ditolak", 403);
    console.error(e);
    return err("Server error", 500);
  }
}
