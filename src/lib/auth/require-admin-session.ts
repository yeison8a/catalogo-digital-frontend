
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
 * Comprueba que exista una sesión administrativa
 * y que Spring Boot acepte su JWT.
 *
 * No devuelve el token a componentes del navegador.
 *
 * Si la sesión no existe, venció o fue rechazada,
 * redirige al formulario de inicio de sesión.
 */
export async function requireAdminSession():
  Promise<void> {

  // 1. Leer la cookie HttpOnly en Next.js.
  const token = await getAdminSessionToken();

  if (!token) {
    redirect("/admin/login");
  }

  // 2. Verificar el JWT contra una ruta protegida
  // de Spring Boot.
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

  // 3. Token inválido, vencido, cuenta desactivada
  // o usuario sin autorización.
  if (
    response.status === 401 ||
    response.status === 403
  ) {
    redirect("/admin/login");
  }

  // 4. No confundir una falla del servidor con
  // una sesión inválida.
  if (!response.ok) {
    throw new Error(
      "No fue posible verificar la sesión administrativa."
    );
  }

  // 5. Spring Boot autorizó la petición.
  // No necesitamos devolver los datos consultados.
}
