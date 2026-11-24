
"use server";

import {
  getAdminMutationToken,
} from "@/lib/auth/admin-mutation-token";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

/**
 * Datos que acepta ProductRequest
 * en Spring Boot.
 */
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

/**
 * Resultado de la creación.
 */
export type CreateProductResult =
  | {
      success: true;
      productId: string;
    }
  | {
      success: false;
      message: string;
    };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Crea un producto real mediante Spring Boot.
 *
 * Flujo:
 * 1. Comprobar el entorno.
 * 2. Recuperar el JWT de la cookie HttpOnly.
 * 3. Validar los datos recibidos.
 * 4. Enviar la petición autenticada.
 * 5. Confirmar el UUID generado.
 *
 * Spring Boot valida el JWT, el rol ADMIN
 * y el estado del administrador.
 */
export async function createProductAction(
  input: CreateProductInput
): Promise<CreateProductResult> {

  // 1. Conservar la restricción temporal
  // del entorno de desarrollo local.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  // 2. Recuperar el JWT administrativo.
  const token = await getAdminMutationToken();

  // Rechazar operaciones sin sesión.
  if (!token) {
    return {
      success: false,
      message:
        "Tu sesión ha vencido o no has iniciado sesión. Ingresa nuevamente.",
    };
  }

  // 3. Validar la estructura de los datos.
  if (
    !input ||
    typeof input.name !== "string" ||
    typeof input.description !== "string" ||
    typeof input.price !== "number" ||
    typeof input.categoryId !== "string"
  ) {
    return {
      success: false,
      message: "Los datos del producto no son válidos.",
    };
  }

  const name = input.name.trim();
  const description = input.description.trim();
  const categoryId = input.categoryId;

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
    input.price < 0 ||
    !Number.isInteger(input.price) ||
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

    // 4. Enviar el producto a Spring Boot
    // utilizando la sesión administrativa.
    const response = await fetch(
      `${API_BASE_URL}/admin/products`,
      {
        method: "POST",
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

    // Sesión vencida o usuario no autorizado.
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

    // Categoría inexistente o inválida.
    if (response.status === 404) {
      return {
        success: false,
        message:
          "La categoría seleccionada no existe.",
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
          "No fue posible crear el producto debido a una restricción del backend.",
      };
    }

    // Otros errores HTTP.
    if (!response.ok) {
      console.error(
        "Error creando producto:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible guardar el producto.",
      };
    }

    // 5. Obtener el UUID real generado
    // por Spring Boot.
    const product: unknown = await response.json();

    if (
      typeof product !== "object" ||
      product === null ||
      !("id" in product) ||
      typeof product.id !== "string" ||
      !UUID_REGEX.test(product.id)
    ) {
      return {
        success: false,
        message:
          "El servidor respondió correctamente, pero no se pudo confirmar el identificador del producto. Consulta el listado antes de reintentar.",
      };
    }

    // Producto guardado y confirmado.
    return {
      success: true,
      productId: product.id,
    };

  } catch (error) {
    console.error(
      "Error de conexión al crear producto:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo conectar con Spring Boot. Verifica que el backend esté ejecutándose.",
    };
  }
}
