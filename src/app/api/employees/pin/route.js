// src/app/api/employees/pin/route.js
// GET /api/employees/pin — returns bcrypt PIN hashes for admin management
// Only accessible by manager and superadmin roles

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getCurrentUser } from "@/lib/session";
import { ok, err } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return err("Harus login", 401);
    if (!["manager", "superadmin"].includes(currentUser.role)) return err("Akses ditolak", 403);

    const result = await db
      .select({ id: users.id, name: users.name, pin: users.pin, role: users.role, outletId: users.outletId })
      .from(users)
      .where(eq(users.isActive, 1));

    // Manager: only their outlet's employees. Superadmin: all employees.
    if (currentUser.role === "manager") {
      return ok(result.filter(u => u.outletId === currentUser.outletId && u.role === "karyawan"));
    }

    return ok(result.filter(u => u.role === "karyawan"));
  } catch (error) {
    console.error("GET /api/employees/pin error:", error);
    return err("Server error", 500);
  }
}