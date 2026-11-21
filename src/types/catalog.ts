
// Respuesta de CategoryResponse en Spring Boot
import type { Category } from "./product";

export type { Category };

// Respuesta de ProductResponse en Spring Boot
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  active: boolean;
  categoryId: string;
  categoryName: string;
  mainImageUrl: string | null;
}

// Respuesta de error de nuestro backend
export interface ApiErrorResponse {
  status: number;
  message: string;
}
