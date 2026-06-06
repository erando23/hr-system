// src/app/api/outlets/route.js

import { db } from "@/lib/db";
import { outlets } from "@/lib/schema";
import { requireAuth } from "@/lib/session";
import { ok, err } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    await requireAuth();
    const rows = await db.select().from(outlets);
    return ok(rows);
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    if (user.role !== "superadmin") return err("Hanya superadmin", 403);

    const { name, address, lat, lng, radius, isSingleShift, outletHours, offDay } = await request.json();
    if (!name || !address || !lat || !lng) return err("Field tidak lengkap", 400);

    const id = `o${Date.now()}`;
    await db.insert(outlets).values({
      id,
      name,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: radius || 50,
      isSingleShift: !!isSingleShift,
      outletHours: outletHours ? JSON.stringify(outletHours) : null,
      offDay: offDay !== undefined ? offDay : null,
    });

    return ok({ id, name, address, lat, lng, radius }, 201);
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}

export async function PATCH(request) {
  try {
    const user = await requireAuth();
    if (user.role !== "superadmin") return err("Hanya superadmin", 403);

    const { id, ...updates } = await request.json();
    if (!id) return err("id diperlukan", 400);

    // Stringify outletHours if present, keep offDay as integer
    const parsed = { ...updates };
    if (parsed.outletHours) parsed.outletHours = JSON.stringify(parsed.outletHours);
    if (parsed.offDay !== undefined) parsed.offDay = parsed.offDay;

    await db.update(outlets).set(parsed).where(eq(outlets.id, id));
    return ok({ message: "Outlet diupdate" });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}
