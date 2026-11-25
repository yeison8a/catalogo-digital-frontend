
"use server";

import { redirect } from "next/navigation";

import {
  deleteAdminSession,
} from "@/lib/auth/admin-session";

export async function logoutAdminAction():
  Promise<void> {

  // Eliminar la sesión administrativa.
  await deleteAdminSession();

  // Redirigir al formulario de acceso.
  redirect("/admin/login");
}
