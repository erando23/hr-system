// src/app/api/employees/list/route.js
// Returns only active non-superadmin users — used for login employee selection

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { ok } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select({
        id:       users.id,
        name:     users.name,
        outletId: users.outletId,
        dept:     users.dept,
        role:     users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.isActive, 1));

    return ok(result);
  } catch (error) {
    console.error("GET /api/employees/list error:", error);
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}