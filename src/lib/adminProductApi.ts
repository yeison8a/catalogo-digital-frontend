
import "server-only";

import type { Product } from "@/types/catalog";

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
 * Error específico del servicio administrativo
 * de productos de Spring Boot.
 */
export class AdminProductApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string
  ) {
    super(
      `Error HTTP ${status} al consultar ${endpoint}`
    );

    this.name = "AdminProductApiError";
  }
}

/**
 * Realiza consultas GET administrativas
 * autenticadas mediante JWT.
 *
 * Este módulo se utiliza exclusivamente
 * desde el servidor de Next.js.
 */
async function adminGet<T>(
  endpoint: string
): Promise<T> {

  // 1. Obtener JWT desde la cookie HttpOnly.
  const token = await getAdminSessionToken();

  // 2. Impedir consultas sin sesión.
  if (!token) {
    redirectIfAdminUnauthorized(401);
    throw new AdminProductApiError(401, endpoint);
  }

  // 3. Consultar Spring Boot con JWT.
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

  // 4. Redirigir si Spring Boot rechaza el JWT.
  redirectIfAdminUnauthorized(response.status);

  // 5. Propagar otros errores HTTP.
  if (!response.ok) {
    throw new AdminProductApiError(
      response.status,
      endpoint
    );
  }

  // 6. Devolver los datos.
  return (await response.json()) as T;
}

/**
 * Obtiene todos los productos administrativos
 * registrados en PostgreSQL.
 *
 * Incluye publicados, ocultos y agotados.
 */
export async function getAdminProducts():
  Promise<Product[]> {

  return adminGet<Product[]>(
    "/admin/products"
  );
}

/**
 * Obtiene un producto administrativo
 * mediante su UUID.
 *
 * Devuelve null cuando:
 * - El UUID tiene un formato inválido.
 * - El backend devuelve HTTP 404.
 *
 * Los demás errores siguen propagándose.
 */
export async function getAdminProductById(
  id: string
): Promise<Product | null> {

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!UUID_REGEX.test(id)) {
    return null;
  }

  try {
    return await adminGet<Product>(
      `/admin/products/${id}`
    );
  } catch (error) {
    if (
      error instanceof AdminProductApiError &&
      error.status === 404
    ) {
      return null;
    }

    throw error;
  }
}
