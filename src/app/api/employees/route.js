// src/app/api/employees/route.js

import { db } from "@/lib/db";
import { users, outlets } from "@/lib/schema";
import { requireAuth, requireRole } from "@/lib/session";
import { ok, err } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

// GET — daftar karyawan (manager hanya lihat outletnya, superadmin semua)
export async function GET(request) {
  try {
    const user = await requireAuth();
    if (!["manager","superadmin"].includes(user.role)) {
      return err("Akses ditolak", 403);
    }

    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get("outletId");

    const allUsers = await db.select({
      id:       users.id,
      name:     users.name,
      outletId: users.outletId,
      dept:     users.dept,
      gaji:     users.gaji,
      role:     users.role,
      isActive: users.isActive,
      createdAt:users.createdAt,
    }).from(users);

    let result = allUsers.filter(u => u.role !== "superadmin");

    // Manager hanya lihat outletnya sendiri
    if (user.role === "manager") {
      result = result.filter(u => u.outletId === user.outletId);
    } else if (outletId) {
      result = result.filter(u => u.outletId === outletId);
    }

    return ok(result);
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    return err("Server error", 500);
  }
}

// POST — tambah karyawan baru
export async function POST(request) {
  try {
    const user = await requireRole("manager", "superadmin");
    const body = await request.json();
    const { name, dept, outletId, gaji, role = "karyawan", pin } = body;

    if (!name || !dept || !outletId || !gaji || !pin) {
      return err("Semua field wajib diisi", 400);
    }

    // Manager hanya bisa tambah ke outletnya
    if (user.role === "manager" && outletId !== user.outletId) {
      return err("Manager hanya bisa menambah karyawan ke outletnya sendiri", 403);
    }

    const id = `u${Date.now()}`;

    await db.insert(users).values({
      id, name, outletId, dept,
      gaji: parseInt(gaji),
      role,
      pin,
    });

    return ok({ id, name, dept, outletId, gaji, role }, 201);
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Akses ditolak", 403);
    return err("Server error: " + e.message, 500);
  }
}

// PATCH — update karyawan (pindah outlet, update gaji, dll)
export async function PATCH(request) {
  try {
    const user = await requireRole("manager", "superadmin");
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return err("id karyawan diperlukan", 400);

    // Hapus field yang tidak boleh diubah langsung
    delete updates.id;
    delete updates.role;
    delete updates.createdAt;

    await db.update(users).set(updates).where(eq(users.id, id));

    return ok({ message: "Karyawan berhasil diupdate" });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return err("Belum login", 401);
    if (e.message === "FORBIDDEN") return err("Akses ditolak", 403);
    return err("Server error", 500);
  }
}
