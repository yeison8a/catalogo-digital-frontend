
"use server";

import {
  getAdminMutationToken,
} from "@/lib/auth/admin-mutation-token";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

const UUID_REGEX =
  /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export type ProductStatusResult =
  | { success: true }
  | { success: false; message: string };

type StatusField = "active" | "available";

interface ProductStatusResponse {
  id: string;
  active: boolean;
  available: boolean;
}

/**
 * Función interna para actualizar un estado.
 *
 * No se exporta como Server Action.
 *
 * Exige JWT antes de realizar cualquier
 * modificación en Spring Boot.
 */
async function updateStatus(
  productId: string,
  field: StatusField,
  value: boolean
): Promise<ProductStatusResult> {


  // Recuperar la sesión del administrador.
  const token = await getAdminMutationToken();

  // No permitir modificaciones sin sesión.
  if (!token) {
    return {
      success: false,
      message:
        "Tu sesión ha vencido o no has iniciado sesión. Ingresa nuevamente.",
    };
  }

  // Validar identificador.
  if (
    typeof productId !== "string" ||
    !UUID_REGEX.test(productId)
  ) {
    return {
      success: false,
      message: "El identificador del producto no es válido.",
    };
  }

  // Validar estado.
  if (typeof value !== "boolean") {
    return {
      success: false,
      message: "El estado enviado no es válido.",
    };
  }

  const endpoint =
    field === "active"
      ? "publication"
      : "availability";

  try {
    // Enviar la modificación autenticada
    // al backend Spring Boot.
    const response = await fetch(
      `${API_BASE_URL}/admin/products/${productId}/${endpoint}`,
      {
        method: "PATCH",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [field]: value,
        }),
      }
    );

    // Sesión vencida o token rechazado.
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
        message: "El producto ya no existe.",
      };
    }

    // Solicitud inválida.
    if (response.status === 400) {
      return {
        success: false,
        message:
          "Spring Boot rechazó el cambio solicitado.",
      };
    }

    // Conflicto con las reglas del backend.
    if (response.status === 409) {
      return {
        success: false,
        message:
          "No se puede realizar el cambio debido a una restricción del backend.",
      };
    }

    if (!response.ok) {
      console.error(
        "Error actualizando estado:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible actualizar el estado del producto.",
      };
    }

    // Confirmar que el backend devolvió
    // el estado solicitado.
    const updated: ProductStatusResponse =
      await response.json();

    if (
      updated.id.toLowerCase() !==
        productId.toLowerCase() ||
      updated[field] !== value
    ) {
      return {
        success: false,
        message:
          "No se pudo confirmar el estado actualizado. Recarga la página antes de reintentar.",
      };
    }

    return { success: true };

  } catch (error) {
    console.error(
      "Error de conexión con Spring Boot:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo completar la operación. Comprueba el estado del producto antes de reintentar.",
    };
  }
}

/**
 * Publicar u ocultar un producto.
 */
export async function updateProductPublicationAction(
  productId: string,
  active: boolean
): Promise<ProductStatusResult> {

  return updateStatus(
    productId,
    "active",
    active
  );
}

/**
 * Marcar un producto como disponible
 * o agotado.
 */
export async function updateProductAvailabilityAction(
  productId: string,
  available: boolean
): Promise<ProductStatusResult> {

  return updateStatus(
    productId,
    "available",
    available
  );
}
