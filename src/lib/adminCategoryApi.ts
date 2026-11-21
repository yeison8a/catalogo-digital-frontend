
import "server-only";

import type { Category } from "@/types/product";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

/**
 * Error específico de la API administrativa.
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
 * Cliente HTTP para las categorías administrativas.
 *
 * En este paso solo implementamos las consultas.
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
export async function getAdminCategories(): Promise<Category[]> {
  return adminGet<Category[]>(
    "/admin/categories"
  );
}
