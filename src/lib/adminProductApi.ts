
import "server-only";

import type { Product } from "@/types/catalog";

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
 * Realiza solicitudes GET al backend.
 *
 * Este servicio se utiliza exclusivamente
 * desde componentes de servidor Next.js.
 */
async function adminGet<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new AdminProductApiError(
      response.status,
      endpoint
    );
  }

  return (await response.json()) as T;
}

/**
 * Obtiene todos los productos administrativos
 * registrados en PostgreSQL.
 *
 * Incluye publicados, ocultos y agotados.
 */
export async function getAdminProducts(): Promise<Product[]> {
  return adminGet<Product[]>(
    "/admin/products"
  );
}


/**
 * Obtiene un producto administrativo por su UUID.
 *
 * A diferencia del endpoint público, permite
 * consultar también productos ocultos.
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

    // Otros errores deben seguir propagándose.
    throw error;
  }
}

