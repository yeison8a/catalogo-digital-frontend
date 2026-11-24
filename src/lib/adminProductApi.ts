
import "server-only";

import type { Product } from "@/types/catalog";

import {
  getAdminSessionToken,
} from "@/lib/auth/admin-session";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

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
 * Realiza solicitudes GET autenticadas
 * al backend Spring Boot.
 *
 * Este servicio se utiliza exclusivamente
 * desde componentes de servidor Next.js.
 *
 * El JWT se obtiene desde una cookie HttpOnly
 * y nunca se expone al navegador mediante
 * variables públicas o componentes React.
 */
async function adminGet<T>(
  endpoint: string
): Promise<T> {

  // 1. Obtener el JWT de la sesión actual.
  const token = await getAdminSessionToken();

  // 2. Rechazar la petición si no existe sesión.
  if (!token) {
    throw new AdminProductApiError(
      401,
      endpoint
    );
  }

  // 3. Realizar la petición autenticada.
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

  // 4. Comprobar la respuesta de Spring Boot.
  if (!response.ok) {
    throw new AdminProductApiError(
      response.status,
      endpoint
    );
  }

  // 5. Devolver los datos recibidos.
  return (await response.json()) as T;
}

/**
 * Obtiene todos los productos administrativos
 * registrados en PostgreSQL.
 *
 * Incluye productos publicados, ocultos
 * y agotados.
 *
 * Requiere un JWT válido y una cuenta ADMIN
 * activa en Spring Boot.
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
 * A diferencia del endpoint público,
 * permite consultar productos ocultos.
 *
 * Devuelve null cuando:
 * - El UUID tiene un formato inválido.
 * - El backend responde HTTP 404.
 *
 * Los errores 401, 403 y otros errores
 * siguen propagándose.
 */
export async function getAdminProductById(
  id: string
): Promise<Product | null> {

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Validar el formato antes de consultar.
  if (!UUID_REGEX.test(id)) {
    return null;
  }

  try {
    return await adminGet<Product>(
      `/admin/products/${id}`
    );
  } catch (error) {

    // Un producto inexistente devuelve null.
    if (
      error instanceof AdminProductApiError &&
      error.status === 404
    ) {
      return null;
    }

    // Propagar cualquier otro error,
    // incluyendo sesiones inválidas.
    throw error;
  }
}
