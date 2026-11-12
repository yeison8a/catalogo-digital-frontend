
import type {
  Product,
  Category,
} from "@/types/product";

import { apiGet } from "@/lib/apiClient";

// Obtener todos los productos
export async function getProducts(
  signal?: AbortSignal
): Promise<Product[]> {
  return apiGet<Product[]>("/products", signal);
}

// Obtener un producto por su identificador
export async function getProduct(
  id: string,
  signal?: AbortSignal
): Promise<Product> {
  return apiGet<Product>(
    `/products/${encodeURIComponent(id)}`,
    signal
  );
}

// Obtener todas las categorías
export async function getCategories(
  signal?: AbortSignal
): Promise<Category[]> {
  return apiGet<Category[]>("/categories", signal);
}
