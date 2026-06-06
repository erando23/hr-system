// src/app/api/kasbon/route.js

import { db } from "@/lib/db";
import { kasbon } from "@/lib/schema";
import { requireAuth } from "@/lib/session";
import { ok, err, todayStr } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

// GET — ambil kasbon
export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const userId   = searchParams.get("userId") || user.id;
    const outletId = searchParams.get("outletId");

    if (userId !== user.id && !["manager","superadmin"].includes(user.role)) {
      return err("Akses ditolak", 403);
    }

    const rows = await db.select().from(kasbon);

    let filtered = rows;
    if (userId !== "all") filtered = filtered.filter(k => k.userId === userId);

    return ok(filtered.sort((a,b) => b.id - a.id));
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}

// POST — ajukan kasbon baru
export async function POST(request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { amount, note, userId } = body;

    if (!amount || amount <= 0) return err("Jumlah kasbon tidak valid", 400);

    // Karyawan hanya bisa ajukan untuk dirinya sendiri
    const targetUserId = userId && ["manager","superadmin"].includes(user.role) ? userId : user.id;

    const result = await db.insert(kasbon).values({
      userId: targetUserId,
      amount: parseInt(amount),
      date: todayStr(),
      note: note || "",
      status: ["manager","superadmin"].includes(user.role) ? "aktif" : "pending",
      approvedBy: ["manager","superadmin"].includes(user.role) ? user.id : null,
    });

    return ok({ message: "Kasbon berhasil diajukan", id: result.lastInsertRowid }, 201);
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}

// PATCH — update status kasbon (approve/lunas/tolak)
export async function PATCH(request) {
  try {
    const user = await requireAuth();
    if (!["manager","superadmin"].includes(user.role)) {
      return err("Akses ditolak", 403);
    }

    const { id, status, rejectNote } = await request.json();
    if (!id || !status) return err("id dan status diperlukan", 400);

    await db.update(kasbon)
      .set({
        status,
        approvedBy: user.id,
        rejectNote: rejectNote || null,
      })
      .where(eq(kasbon.id, id));

    return ok({ message: "Status kasbon diupdate" });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}
