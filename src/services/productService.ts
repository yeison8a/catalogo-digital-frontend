
import "server-only";

import {
  getCategories,
  getProductById as getApiProductById,
} from "@/lib/catalog-api";

import { toUiProduct } from "@/lib/productAdapter";

import type { Product } from "@/types/product";

import { CatalogApiError } from "@/lib/catalog-api";

/**
 * Obtiene un producto publicado desde Spring Boot
 * y lo adapta al modelo utilizado por Next.js.
 */
export async function getProductById(
  id: string
): Promise<Product | null> {

  // Evitar solicitudes con identificadores vacíos.
  if (!id || !id.trim()) {
    return null;
  }

  try {
    // Consultar el producto y las categorías reales.
    const [apiProduct, categories] = await Promise.all([
      getApiProductById(id),
      getCategories(),
    ]);

    // Adaptar al formato utilizado por el frontend.
    return toUiProduct(apiProduct, categories);

  } catch (error) {

    // Un 404 significa que el producto no existe
    // o no está publicado.
    if (
      error instanceof CatalogApiError &&
      error.status === 404
    ) {
      return null;
    }

    // Otros errores deben mostrarse como errores
    // del servidor, no como productos inexistentes.
    throw error;
  }
}
