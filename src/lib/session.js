// src/lib/session.js
// Konfigurasi iron-session untuk autentikasi berbasis cookie terenkripsi

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET,
  cookieName: "hr_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",  // HTTPS only di production
    httpOnly: true,                                  // Tidak bisa diakses JS di browser
    maxAge: 60 * 60 * 8,                             // 8 jam session
  },
};

// Ambil session dari request saat ini
export async function getSession() {
  const session = await getIronSession(await cookies(), SESSION_OPTIONS);
  return session;
}

// Ambil user dari session — null jika belum login
export async function getCurrentUser() {
  const session = await getSession();
  return session.user ?? null;
}

// Middleware guard — lempar error jika belum login
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

// Guard untuk role tertentu
export async function requireRole(...roles) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
