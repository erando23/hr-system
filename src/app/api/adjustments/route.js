// src/app/api/adjustments/route.js

import { db } from "@/lib/db";
import { adjustments } from "@/lib/schema";
import { requireAuth, requireRole } from "@/lib/session";
import { ok, err, todayStr } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function GET(request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const rows = await db.select().from(adjustments);
    const filtered = userId ? rows.filter(a => a.userId === userId) : rows;

    return ok(filtered.sort((a,b) => b.id - a.id));
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireRole("superadmin");
    const { userId, type, amount, note } = await request.json();

    if (!userId || !type || !amount) return err("Field tidak lengkap", 400);
    if (!["tambah","potong"].includes(type)) return err("Type tidak valid", 400);

    const result = await db.insert(adjustments).values({
      userId, type,
      amount: parseInt(amount),
      date: todayStr(),
      note: note || "",
      createdBy: user.id,
    });

    return ok({ id: result.lastInsertRowid }, 201);
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Hanya superadmin", 403);
    return err("Server error", 500);
  }
}

export async function DELETE(request) {
  try {
    await requireRole("superadmin");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return err("id diperlukan", 400);

    const [existing] = await db.select().from(adjustments).where(eq(adjustments.id, parseInt(id)));
    if (!existing) return err("Penyesuaian tidak ditemukan", 404);
    if (existing.appliedToPayrollId) {
      return err("Penyesuaian sudah masuk payroll — tidak bisa dihapus", 400);
    }

    await db.delete(adjustments).where(eq(adjustments.id, parseInt(id)));
    return ok({ message: "Penyesuaian dihapus" });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Hanya superadmin", 403);
    return err("Server error", 500);
  }
}

// PATCH — update adjustment (only if not applied to a payroll yet)
export async function PATCH(request) {
  try {
    await requireRole("superadmin");
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return err("id diperlukan", 400);

    const [existing] = await db.select().from(adjustments).where(eq(adjustments.id, parseInt(id)));
    if (!existing) return err("Penyesuaian tidak ditemukan", 404);
    if (existing.appliedToPayrollId) {
      return err("Penyesuaian sudah masuk payroll — tidak bisa diubah", 400);
    }

    delete updates.id;
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.appliedToPayrollId;

    if (updates.amount !== undefined) updates.amount = parseInt(updates.amount);
    if (updates.type && !["tambah", "potong"].includes(updates.type)) {
      return err("Type tidak valid", 400);
    }

    await db.update(adjustments).set(updates).where(eq(adjustments.id, parseInt(id)));
    return ok({ message: "Penyesuaian diupdate" });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Hanya superadmin", 403);
    return err("Server error", 500);
  }
}
