
"use server";

import type {
  CreateProductInput,
} from "@/app/(admin)/admin/products/new/actions";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type UpdateProductResult =
  | {
      success: true;
      productId: string;
    }
  | {
      success: false;
      message: string;
    };

/**
 * Actualiza los datos de un producto existente.
 *
 * Spring Boot conserva el UUID original.
 */
export async function updateProductAction(
  productId: string,
  input: CreateProductInput
): Promise<UpdateProductResult> {

  // El administrador todavía no tiene autenticación.
  // Restringir las operaciones a desarrollo local.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  if (
    typeof productId !== "string" ||
    !UUID_REGEX.test(productId)
  ) {
    return {
      success: false,
      message: "El identificador del producto no es válido.",
    };
  }

  if (
    !input ||
    typeof input.name !== "string" ||
    typeof input.description !== "string" ||
    typeof input.price !== "number" ||
    typeof input.categoryId !== "string"
  ) {
    return {
      success: false,
      message: "Los datos enviados no son válidos.",
    };
  }

  const name = input.name.trim();
  const description = input.description.trim();
  const categoryId = input.categoryId.trim();

  if (name.length < 2 || name.length > 150) {
    return {
      success: false,
      message:
        "El nombre debe tener entre 2 y 150 caracteres.",
    };
  }

  if (description.length > 2000) {
    return {
      success: false,
      message:
        "La descripción no puede superar los 2000 caracteres.",
    };
  }

  if (
    !Number.isFinite(input.price) ||
    !Number.isInteger(input.price) ||
    input.price < 0 ||
    input.price > 9999999999
  ) {
    return {
      success: false,
      message:
        "Ingresa un precio válido en pesos colombianos.",
    };
  }

  if (!UUID_REGEX.test(categoryId)) {
    return {
      success: false,
      message: "Selecciona una categoría válida.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/products/${productId}`,
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price: input.price,
          categoryId,
        }),
      }
    );

    if (response.status === 404) {
      return {
        success: false,
        message: "El producto ya no existe.",
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message:
          "Spring Boot rechazó los datos del producto.",
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        message:
          "No se puede actualizar el producto debido a una restricción del backend.",
      };
    }

    if (!response.ok) {
      console.error(
        "Error actualizando producto:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible actualizar el producto.",
      };
    }

    // Confirmar la respuesta real del backend.
    const updatedProduct: unknown =
      await response.json();

    if (
      typeof updatedProduct !== "object" ||
      updatedProduct === null ||
      !("id" in updatedProduct) ||
      updatedProduct.id !== productId
    ) {
      return {
        success: false,
        message:
          "El backend respondió correctamente, pero no se pudo confirmar el producto actualizado. Verifica el listado antes de reintentar.",
      };
    }

    return {
      success: true,
      productId,
    };

  } catch (error) {
    console.error(
      "Error de conexión al actualizar producto:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo conectar con Spring Boot.",
    };
  }
}
