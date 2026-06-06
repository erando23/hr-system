// src/app/api/adjustments/unapply/route.js
// POST — unapply adjustments (reset appliedToPayrollId) untuk karyawan pada bulan tertentu
// Hanya superadmin. Hapus payroll_adjustments rows juga, agar re-generate bersih.

import { db } from "@/lib/db";
import { adjustments, payrolls, payrollAdjustments } from "@/lib/schema";
import { requireRole } from "@/lib/session";
import { ok, err } from "@/lib/utils";
import { eq, and, isNotNull } from "drizzle-orm";

export async function POST(request) {
  try {
    await requireRole("superadmin");
    const body = await request.json();
    const { month, userId } = body;
    if (!month || !userId) return err("month dan userId diperlukan", 400);

    // Cari payroll untuk karyawan & bulan ini
    const [payroll] = await db.select().from(payrolls)
      .where(and(eq(payrolls.userId, userId), eq(payrolls.month, month)));
    if (!payroll) return err("Payroll belum di-generate", 404);
    if (payroll.status === "paid") return err("Payroll sudah dibayar — tidak bisa unapply", 400);

    // Reset appliedToPayrollId di semua adjustment untuk karyawan ini
    await db.update(adjustments)
      .set({ appliedToPayrollId: null })
      .where(and(eq(adjustments.userId, userId), eq(adjustments.appliedToPayrollId, payroll.id)));

    // Hapus payroll_adjustments rows (akan dibuat ulang saat re-publish)
    await db.delete(payrollAdjustments).where(eq(payrollAdjustments.payrollId, payroll.id));

    // Hapus payroll agar generate ulang bersih
    await db.delete(payrolls).where(eq(payrolls.id, payroll.id));

    return ok({ message: "Penyesuaian di-unapply. Silakan generate ulang payroll." });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Hanya superadmin", 403);
    return err("Server error: " + e.message, 500);
  }
}