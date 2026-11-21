
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
