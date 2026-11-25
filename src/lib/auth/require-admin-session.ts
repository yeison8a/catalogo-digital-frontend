
import "server-only";

import { redirect } from "next/navigation";

import {
  getAdminSessionToken,
} from "@/lib/auth/admin-session";

const API_BASE_URL = (
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1"
).replace(/\/+$/, "");

/**
 * Redirige al login cuando Spring Boot
 * rechaza la autenticación o autorización.
 *
 * Puede reutilizarse desde clientes HTTP
 * ejecutados exclusivamente en el servidor.
 */
export function redirectIfAdminUnauthorized(
  status: number
): void {
  if (status === 401 || status === 403) {
    redirect("/admin/login");
  }
}

/**
 * Verifica que el administrador tenga
 * una sesión válida y autorizada.
 *
 * Si falta la cookie o Spring Boot rechaza
 * el JWT, redirige a /admin/login.
 *
 * Los errores de conexión o los errores 5xx
 * no se confunden con sesiones vencidas.
 */
export async function requireAdminSession():
  Promise<void> {

  // Recuperar JWT desde la cookie HttpOnly.
  const token = await getAdminSessionToken();

  // No existe una sesión administrativa.
  if (!token) {
    redirect("/admin/login");
  }

  // Consultar un endpoint protegido.
  const response = await fetch(
    `${API_BASE_URL}/admin/products`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    }
  );

  // Rechazar JWT inválido, vencido o sin permisos.
  redirectIfAdminUnauthorized(response.status);

  // No ocultar problemas reales del backend.
  if (!response.ok) {
    throw new Error(
      "No fue posible verificar la sesión administrativa."
    );
  }
}
