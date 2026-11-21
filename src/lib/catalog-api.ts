
import type {
  Category,
  Product,
} from "@/types/catalog";

// Dirección de Spring Boot.
// Solo se utilizará en el servidor.
const API_BASE_URL = process.env.API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "Falta configurar API_BASE_URL en .env.local"
  );
}

// Función genérica para realizar solicitudes GET
async function apiGet<T>(endpoint: string): Promise<T> {

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },

      // Durante el desarrollo consultamos los datos actuales.
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status} al consultar ${endpoint}`
    );
  }

  return (await response.json()) as T;
}

// Obtener las categorías activas
export async function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/categories");
}

// Obtener los productos publicados
export async function getProducts(): Promise<Product[]> {
  return apiGet<Product[]>("/products");
}

// Obtener un producto público por UUID
export async function getProductById(
  id: string
): Promise<Product> {
  return apiGet<Product>(
    `/products/${encodeURIComponent(id)}`
  );
}
