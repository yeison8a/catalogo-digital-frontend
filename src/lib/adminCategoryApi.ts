
import "server-only";

import type { Category } from "@/types/product";

import {
  getAdminSessionToken,
} from "@/lib/auth/admin-session";

const API_BASE_URL = (
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1"
).replace(/\/+$/, "");

/**
 * Error específico de la API administrativa
 * de categorías de Spring Boot.
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
 * Cliente HTTP autenticado para consultas
 * administrativas de categorías.
 *
 * Se ejecuta exclusivamente en el servidor
 * de Next.js.
 */
async function adminGet<T>(
  endpoint: string
): Promise<T> {

  // Obtener JWT desde la cookie HttpOnly.
  const token = await getAdminSessionToken();

  // Rechazar solicitudes sin sesión.
  if (!token) {
    throw new AdminCategoryApiError(
      401,
      endpoint
    );
  }

  // Consultar Spring Boot con JWT.
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

  // Spring Boot valida firma, vencimiento,
  // rol ADMIN y estado del usuario.
  if (!response.ok) {
    throw new AdminCategoryApiError(
      response.status,
      endpoint
    );
  }

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
