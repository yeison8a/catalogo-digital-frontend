
import "server-only";

import type { Category } from "@/types/product";

import {
  getAdminSessionToken,
} from "@/lib/auth/admin-session";

import {
  redirectIfAdminUnauthorized,
} from "@/lib/auth/require-admin-session";

const API_BASE_URL = (
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1"
).replace(/\/+$/, "");

/**
 * Error específico de las consultas
 * administrativas de categorías.
 */
export class AdminCategoryApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string
  ) {
    super(
      `Error HTTP ${status} al consultar ${endpoint}`
    );

    this.name = "AdminCategoryApiError";
  }
}

/**
 * Cliente GET autenticado para categorías.
 *
 * Recupera JWT desde la cookie HttpOnly
 * y lo envía a Spring Boot.
 */
async function adminGet<T>(
  endpoint: string
): Promise<T> {

  // 1. Recuperar la sesión administrativa.
  const token = await getAdminSessionToken();

  // 2. Rechazar consultas sin sesión.
  if (!token) {
    redirectIfAdminUnauthorized(401);
    throw new AdminCategoryApiError(401, endpoint);
  }

  // 3. Consultar Spring Boot.
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 4. Gestionar sesiones rechazadas.
  redirectIfAdminUnauthorized(response.status);

  // 5. Mantener el tratamiento de errores HTTP.
  if (!response.ok) {
    throw new AdminCategoryApiError(
      response.status,
      endpoint
    );
  }

  // 6. Devolver categorías reales.
  return (await response.json()) as T;
}

/**
 * Obtiene todas las categorías administrativas,
 * incluyendo activas e inactivas.
 */
export async function getAdminCategories():
  Promise<Category[]> {

  return adminGet<Category[]>(
    "/admin/categories"
  );
}
