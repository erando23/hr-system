// src/app/api/adjustments/[id]/route.js
// DELETE — hapus adjustment berdasarkan id
// Hanya superadmin. Adjustment yang sudah di-apply ke payroll (appliedToPayrollId != null) tidak bisa dihapus.

import { db } from "@/lib/db";
import { adjustments } from "@/lib/schema";
import { requireRole } from "@/lib/session";
import { ok, err } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function DELETE(_request, { params }) {
  try {
    await requireRole("superadmin");
    const { id } = await params;
    const adjId = parseInt(id, 10);
    if (!adjId) return err("ID adjustment tidak valid", 400);

    const [adj] = await db.select().from(adjustments).where(eq(adjustments.id, adjId));
    if (!adj) return err("Adjustment tidak ditemukan", 404);

    if (adj.appliedToPayrollId) {
      return err("Adjustment sudah diterapkan ke payroll. Unapply dulu sebelum hapus.", 400);
    }

    await db.delete(adjustments).where(eq(adjustments.id, adjId));
    return ok({ message: "Adjustment berhasil dihapus", id: adjId });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Hanya superadmin", 403);
    console.error("DELETE /api/adjustments/[id] error:", e);
    return err("Server error: " + e.message, 500);
  }
}