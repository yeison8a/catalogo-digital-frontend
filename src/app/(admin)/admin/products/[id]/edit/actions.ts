
"use server";

import type {
  CreateProductInput,
} from "@/app/(admin)/admin/products/new/actions";

import {
  getAdminMutationToken,
} from "@/lib/auth/admin-mutation-token";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resultado de actualizar un producto.
 */
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
 *
 * Flujo:
 * 1. Verificar el entorno permitido.
 * 2. Recuperar el JWT administrativo.
 * 3. Validar UUID y datos del producto.
 * 4. Enviar PUT autenticado a Spring Boot.
 * 5. Comprobar la respuesta del backend.
 */
export async function updateProductAction(
  productId: string,
  input: CreateProductInput
): Promise<UpdateProductResult> {

  // 1. Mantener la restricción temporal
  // del panel en desarrollo local.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  // 2. Recuperar JWT desde la cookie HttpOnly.
  const token = await getAdminMutationToken();

  // Impedir operaciones sin sesión.
  if (!token) {
    return {
      success: false,
      message:
        "Tu sesión ha vencido o no has iniciado sesión. Ingresa nuevamente.",
    };
  }

  // 3. Validar identificador del producto.
  if (
    typeof productId !== "string" ||
    !UUID_REGEX.test(productId)
  ) {
    return {
      success: false,
      message:
        "El identificador del producto no es válido.",
    };
  }

  // Validar estructura del producto.
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

  // Validar nombre.
  if (name.length < 2 || name.length > 150) {
    return {
      success: false,
      message:
        "El nombre debe tener entre 2 y 150 caracteres.",
    };
  }

  // Validar descripción.
  if (description.length > 2000) {
    return {
      success: false,
      message:
        "La descripción no puede superar los 2000 caracteres.",
    };
  }

  // Validar precio en pesos colombianos.
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

  // Validar identificador de categoría.
  if (!UUID_REGEX.test(categoryId)) {
    return {
      success: false,
      message:
        "Selecciona una categoría válida.",
    };
  }

  try {

    // 4. Enviar la actualización autenticada.
    const response = await fetch(
      `${API_BASE_URL}/admin/products/${productId}`,
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: input.price,
          categoryId,
        }),
      }
    );

    // JWT vencido, inválido o sin permisos.
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      return {
        success: false,
        message:
          "Tu sesión no está autorizada. Inicia sesión nuevamente.",
      };
    }

    // Producto inexistente.
    if (response.status === 404) {
      return {
        success: false,
        message:
          "El producto ya no existe.",
      };
    }

    // Datos rechazados por Spring Boot.
    if (response.status === 400) {
      return {
        success: false,
        message:
          "Spring Boot rechazó los datos del producto.",
      };
    }

    // Conflicto con reglas de negocio.
    if (response.status === 409) {
      return {
        success: false,
        message:
          "No se puede actualizar el producto debido a una restricción del backend.",
      };
    }

    // Otros errores HTTP.
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

    // 5. Confirmar la respuesta real del backend.
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

    // Actualización confirmada.
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
