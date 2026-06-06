// src/app/api/payroll/route.js

import { db } from "@/lib/db";
import { users, attendances, kasbon, adjustments, payrolls, payrollAdjustments, schedules, outlets } from "@/lib/schema";
import { requireRole } from "@/lib/session";
import { ok, err, calculatePayroll, todayStr, monthStr } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

// GET — preview/get payroll untuk bulan tertentu
export async function GET(request) {
  try {
    const user = await requireRole("superadmin");
    const { searchParams } = new URL(request.url);
    const month    = searchParams.get("month") || monthStr();     // "2026-05"
    const outletId = searchParams.get("outletId") || "";

    if (!month) return err("Parameter month diperlukan", 400);

    // Ambil semua karyawan
    const allUsers = await db.select().from(users).where(eq(users.isActive, 1));
    let targetUsers = allUsers.filter(u => u.role === "karyawan");
    if (outletId) targetUsers = targetUsers.filter(u => u.outletId === outletId);

    const result = [];

    for (const emp of targetUsers) {
      // Absensi bulan ini
      const empAtts = await db.select().from(attendances)
        .where(eq(attendances.userId, emp.id));
      const monthAtts = empAtts.filter(a => a.date.startsWith(month));

      // Auto-detect alpha: hari dalam jadwal (bukan Libur) tapi tidak ada absensi record
      const empScheds = await db.select().from(schedules)
        .where(and(eq(schedules.userId, emp.id), eq(schedules.month, month)));
      const alphaDays = empScheds
        .filter(s => s.shiftKey !== "L")  // bukan hari libur
        .filter(s => !monthAtts.some(a => a.date === `${month}-${String(s.dayNum).padStart(2, "0")}`))
        .map(s => `${month}-${String(s.dayNum).padStart(2, "0")}`);

      // Kasbon aktif
      const empKasbon = await db.select().from(kasbon)
        .where(and(eq(kasbon.userId, emp.id), eq(kasbon.status, "aktif")));

      // Penyesuaian bulan ini (sudah ada di DB)
      const empAdj = await db.select().from(adjustments)
        .where(eq(adjustments.userId, emp.id));
      const monthAdj = empAdj.filter(a => a.date.startsWith(month));

      const calc = calculatePayroll(emp, monthAtts, empKasbon, monthAdj, emp.dept);

      result.push({
        user: {
          id:       emp.id,
          name:     emp.name,
          dept:     emp.dept,
          outletId: emp.outletId,
          gaji:     emp.gaji,
        },
        ...calc,
        autoAlphaDays: alphaDays,
        attendances: monthAtts,
        kasbon: empKasbon,
        adjustments: monthAdj,
      });
    }

    return ok(result);
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Hanya superadmin yang bisa akses payroll", 403);
    console.error(e);
    return err("Server error: " + e.message, 500);
  }
}

// POST — generate & simpan payroll final
export async function POST(request) {
  try {
    const user = await requireRole("superadmin");
    const body = await request.json();
    const { month, outletId, autoCreateAlpha = true } = body;

    if (!month) return err("Parameter month diperlukan", 400);

    const allUsers = await db.select().from(users).where(eq(users.isActive, 1));
    let targetUsers = allUsers.filter(u => u.role === "karyawan");
    if (outletId) targetUsers = targetUsers.filter(u => u.outletId === outletId);

    const now = new Date().toISOString();
    let count = 0;
    const errors = [];

    for (const emp of targetUsers) {
      try {
        // ── 1. Absensi bulan ini ──────────────────────────────
        const empAttsAll = await db.select().from(attendances)
          .where(eq(attendances.userId, emp.id));
        const monthAtts = empAttsAll.filter(a => a.date.startsWith(month));

        // ── 2. Auto-alpha: buat record alpa untuk hari tidak hadir ──
        if (autoCreateAlpha) {
          const empScheds = await db.select().from(schedules)
            .where(and(eq(schedules.userId, emp.id), eq(schedules.month, month)));

          for (const s of empScheds) {
            if (s.shiftKey === "L") continue; // skip libur
            const dateStr = `${month}-${String(s.dayNum).padStart(2, "0")}`;
            const exists = monthAtts.some(a => a.date === dateStr);
            if (!exists) {
              // Cek apakah sudah ada record alpa untuk tanggal ini
              const [existingAtt] = await db.select().from(attendances)
                .where(and(eq(attendances.userId, emp.id), eq(attendances.date, dateStr)));
              if (!existingAtt) {
                await db.insert(attendances).values({
                  userId: emp.id, date: dateStr, dayIdx: s.dayIdx, weekIdx: s.weekIdx,
                  shiftKey: s.shiftKey, status: "alpa",
                  lateMins: 0, earlyMins: 0, overtimeMins: 0,
                  note: "Auto-alpha: tidak ada absensi pada shift terjadwal",
                });
              } else if (existingAtt.status === "belum") {
                await db.update(attendances)
                  .set({ status: "alpa", note: "Auto-alpha: tidak ada absensi pada shift terjadwal", overrideBy: user.id })
                  .where(eq(attendances.id, existingAtt.id));
              }
            }
          }
        }

        // ── 3. Ambil ulang absensi setelah auto-alpha ────────
        const finalAtts = await db.select().from(attendances)
          .where(eq(attendances.userId, emp.id));
        const finalMonthAtts = finalAtts.filter(a => a.date.startsWith(month));

        // ── 4. Kasbon aktif ───────────────────────────────────
        const empKasbon = await db.select().from(kasbon)
          .where(and(eq(kasbon.userId, emp.id), eq(kasbon.status, "aktif")));

        // ── 5. Penyesuaian bulan ini ──────────────────────────
        const empAdjAll = await db.select().from(adjustments)
          .where(eq(adjustments.userId, emp.id));
        const monthAdj = empAdjAll.filter(a => a.date.startsWith(month));

        // ── 6. Hitung payroll ─────────────────────────────────
        const calc = calculatePayroll(emp, finalMonthAtts, empKasbon, monthAdj, emp.dept);

        // ── 7. Cek existing payroll ───────────────────────────
        const existing = await db.select().from(payrolls)
          .where(and(eq(payrolls.userId, emp.id), eq(payrolls.month, month)));

        const payrollData = {
          userId:             emp.id,
          month,
          gajiPokok:          calc.gajiPokok,
          totalHadir:         calc.totalHadir,
          totalLate:          calc.totalLate,
          totalLateMins:      calc.totalLateMins,
          totalAlpha:         calc.totalAlpha,
          totalOvertimeCount: calc.totalOvertimeCount,
          plusLembur:         calc.plusLembur,
          plusBonus:          calc.plusBonus,
          potTerlambat:       calc.potTerlambat,
          potEarlyLeave:      calc.potEarlyLeave,
          potKasbon:          calc.potKasbon,
          potLainnya:         calc.potLainnya,
          detailLembur:       JSON.stringify(calc.lemburDetail),
          detailBonus:        JSON.stringify(calc.bonusDetail),
          detailKasbon:       JSON.stringify(calc.kasbonDetail),
          detailPotongan:     JSON.stringify(calc.potongDetail),
          gajiBersih:         calc.gajiBersih,
          status:             "approved",
          generatedBy:         user.id,
          generatedAt:         now,
        };

        let payrollId;
        if (existing.length > 0) {
          await db.update(payrolls).set(payrollData).where(eq(payrolls.id, existing[0].id));
          payrollId = existing[0].id;
        } else {
          const [newPayroll] = await db.insert(payrolls).values(payrollData).returning();
          payrollId = newPayroll.id;
        }

        // ── 8. Simpan adjustment detail items ke payroll_adjustments ─
        // Hapus dulu yang lama (jika re-generate)
        await db.delete(payrollAdjustments).where(eq(payrollAdjustments.payrollId, payrollId));
        for (const adj of monthAdj) {
          await db.insert(payrollAdjustments).values({
            payrollId:  payrollId,
            adjType:    adj.type,
            amount:     adj.amount,
            note:       adj.note || "",
            createdBy:  adj.createdBy || "",
          });
          // Mark adjustment sebagai applied ke payroll ini
          await db.update(adjustments)
            .set({ appliedToPayrollId: payrollId })
            .where(eq(adjustments.id, adj.id));
        }

        // ── 9. Tandai kasbon aktif sbg lunas ─────────────────
        for (const k of empKasbon) {
          await db.update(kasbon).set({ status: "lunas", rejectNote: `Lunas otomatis saat slip gaji bulan ${month} diterbitkan.` })
            .where(eq(kasbon.id, k.id));
        }

        count++;
      } catch (empErr) {
        errors.push({ empId: emp.id, name: emp.name, error: empErr.message });
      }
    }

    return ok({
      message: `Payroll ${month} berhasil digenerate untuk ${count} karyawan`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Hanya superadmin", 403);
    console.error(e);
    return err("Server error: " + e.message, 500);
  }
}