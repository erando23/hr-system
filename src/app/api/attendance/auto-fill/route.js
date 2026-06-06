// src/app/api/attendance/auto-fill/route.js
// Manual trigger for autoFillAttendance. Manager/SA can call this to backfill
// missing attendance rows for the requested month (defaults to current month).
// Useful when no one logged in for a while and reactive fill didn't fire.

import { requireAuth } from "@/lib/session";
import { ok, err, monthStr } from "@/lib/utils";
import { autoFillAttendance } from "@/lib/autoFill";

export async function POST(request) {
  try {
    const user = await requireAuth();
    if (!["manager", "superadmin"].includes(user.role)) {
      return err("Hanya manager/superadmin yang bisa trigger auto-fill", 403);
    }

    let body = {};
    try { body = await request.json(); } catch {}
    const month = (body?.month && /^\d{4}-\d{2}$/.test(body.month)) ? body.month : monthStr();

    const result = await autoFillAttendance(month);
    return ok({ month, ...result });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    console.error("auto-fill error:", e);
    return err("Server error: " + e.message, 500);
  }
}
