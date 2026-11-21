
import "server-only";

import type { ProductImage } from "@/types/productImage";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

/**
 * Obtiene las fotografías públicas de un producto.
 */
export async function getProductImages(
  productId: string
): Promise<ProductImage[]> {

  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(productId)}/images`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error al consultar imágenes: HTTP ${response.status}`
    );
  }

  const images: ProductImage[] = await response.json();

  // Respetar el orden definido en PostgreSQL.
  return images.sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}
