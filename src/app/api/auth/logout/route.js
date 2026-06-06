// src/app/api/auth/logout/route.js

import { getSession } from "@/lib/session";
import { ok } from "@/lib/utils";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return ok({ message: "Berhasil logout" });
}
