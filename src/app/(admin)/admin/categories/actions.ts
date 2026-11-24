
"use server";

import {
  getAdminMutationToken,
} from "@/lib/auth/admin-mutation-token";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SESSION_REQUIRED_MESSAGE =
  "Tu sesión ha vencido o no has iniciado sesión. Ingresa nuevamente.";

const SESSION_UNAUTHORIZED_MESSAGE =
  "Tu sesión no está autorizada. Inicia sesión nuevamente.";

const LOCAL_ONLY_MESSAGE =
  "La administración solo está habilitada en desarrollo local.";

/**
 * Resultado de crear una categoría.
 */
export type CreateCategoryResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Crea una categoría real en PostgreSQL
 * mediante Spring Boot.
 *
 * Flujo:
 * 1. Comprobar el entorno.
 * 2. Recuperar el JWT administrativo.
 * 3. Validar el nombre.
 * 4. Realizar POST autenticado.
 * 5. Comprobar la respuesta del backend.
 */
export async function createCategoryAction(
  name: string
): Promise<CreateCategoryResult> {

  // 1. Mantener la restricción temporal
  // del entorno de desarrollo local.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message: LOCAL_ONLY_MESSAGE,
    };
  }

  // 2. Recuperar el JWT desde la cookie HttpOnly.
  const token = await getAdminMutationToken();

  // Impedir solicitudes sin sesión.
  if (!token) {
    return {
      success: false,
      message: SESSION_REQUIRED_MESSAGE,
    };
  }

  // 3. Validar el tipo del nombre recibido.
  if (typeof name !== "string") {
    return {
      success: false,
      message:
        "El nombre de la categoría no es válido.",
    };
  }

  const cleanName = name.trim();

  // Validar longitud del nombre.
  if (
    cleanName.length < 2 ||
    cleanName.length > 100
  ) {
    return {
      success: false,
      message:
        "El nombre debe tener entre 2 y 100 caracteres.",
    };
  }

  try {

    // 4. Crear la categoría con JWT.
    const response = await fetch(
      `${API_BASE_URL}/admin/categories`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      }
    );

    // Sesión vencida, inválida o sin permisos.
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      return {
        success: false,
        message: SESSION_UNAUTHORIZED_MESSAGE,
      };
    }

    // Categoría duplicada.
    if (response.status === 409) {
      return {
        success: false,
        message:
          "Ya existe una categoría con ese nombre.",
      };
    }

    // Nombre rechazado por el backend.
    if (response.status === 400) {
      return {
        success: false,
        message:
          "El nombre de la categoría no cumple las validaciones.",
      };
    }

    // Otros errores HTTP.
    if (!response.ok) {
      console.error(
        "Error creando categoría:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible crear la categoría. Inténtalo nuevamente.",
      };
    }

    // Categoría creada correctamente.
    return {
      success: true,
    };

  } catch (error) {
    console.error(
      "Error de conexión al crear categoría:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo conectar con Spring Boot. Verifica que esté ejecutándose.",
    };
  }
}

/**
 * Resultado de actualizar una categoría.
 */
export type UpdateCategoryResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Actualiza el nombre de una categoría
 * existente en PostgreSQL.
 *
 * Requiere una sesión administrativa.
 */
export async function updateCategoryAction(
  categoryId: string,
  name: string
): Promise<UpdateCategoryResult> {

  // 1. Mantener restricción temporal.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message: LOCAL_ONLY_MESSAGE,
    };
  }

  // 2. Recuperar JWT administrativo.
  const token = await getAdminMutationToken();

  if (!token) {
    return {
      success: false,
      message: SESSION_REQUIRED_MESSAGE,
    };
  }

  // 3. Validar UUID de la categoría.
  if (
    typeof categoryId !== "string" ||
    !UUID_REGEX.test(categoryId)
  ) {
    return {
      success: false,
      message:
        "El identificador de la categoría no es válido.",
    };
  }

  // 4. Validar tipo del nombre.
  if (typeof name !== "string") {
    return {
      success: false,
      message:
        "El nombre de la categoría no es válido.",
    };
  }

  const cleanName = name.trim();

  // Validar longitud.
  if (
    cleanName.length < 2 ||
    cleanName.length > 100
  ) {
    return {
      success: false,
      message:
        "El nombre debe tener entre 2 y 100 caracteres.",
    };
  }

  try {

    // 5. Enviar PUT autenticado.
    const response = await fetch(
      `${API_BASE_URL}/admin/categories/${categoryId}`,
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      }
    );

    // JWT rechazado.
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      return {
        success: false,
        message: SESSION_UNAUTHORIZED_MESSAGE,
      };
    }

    // Categoría inexistente.
    if (response.status === 404) {
      return {
        success: false,
        message:
          "La categoría ya no existe.",
      };
    }

    // Nombre duplicado.
    if (response.status === 409) {
      return {
        success: false,
        message:
          "Ya existe otra categoría con ese nombre.",
      };
    }

    // Datos inválidos.
    if (response.status === 400) {
      return {
        success: false,
        message:
          "Los datos enviados no cumplen las validaciones del backend.",
      };
    }

    // Otros errores HTTP.
    if (!response.ok) {
      console.error(
        "Error actualizando categoría:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible actualizar la categoría.",
      };
    }

    // Actualización completada.
    return {
      success: true,
    };

  } catch (error) {
    console.error(
      "Error de conexión al actualizar categoría:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo conectar con Spring Boot.",
    };
  }
}

/**
 * Resultado de modificar el estado de una categoría.
 */
export type UpdateCategoryStatusResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Activa o desactiva una categoría en PostgreSQL
 * mediante Spring Boot.
 *
 * Requiere JWT administrativo.
 */
export async function updateCategoryStatusAction(
  categoryId: string,
  active: boolean
): Promise<UpdateCategoryStatusResult> {

  // 1. Mantener la restricción temporal.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message: LOCAL_ONLY_MESSAGE,
    };
  }

  // 2. Recuperar el JWT administrativo.
  const token = await getAdminMutationToken();

  if (!token) {
    return {
      success: false,
      message: SESSION_REQUIRED_MESSAGE,
    };
  }

  // 3. Validar UUID de la categoría.
  if (
    typeof categoryId !== "string" ||
    !UUID_REGEX.test(categoryId)
  ) {
    return {
      success: false,
      message:
        "El identificador de la categoría no es válido.",
    };
  }

  // 4. Validar el valor recibido.
  if (typeof active !== "boolean") {
    return {
      success: false,
      message:
        "El estado enviado no es válido.",
    };
  }

  try {

    // 5. Enviar PATCH autenticado.
    const response = await fetch(
      `${API_BASE_URL}/admin/categories/${categoryId}/status`,
      {
        method: "PATCH",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active,
        }),
      }
    );

    // JWT inválido, vencido o sin permisos.
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      return {
        success: false,
        message: SESSION_UNAUTHORIZED_MESSAGE,
      };
    }

    // Categoría inexistente.
    if (response.status === 404) {
      return {
        success: false,
        message:
          "La categoría ya no existe.",
      };
    }

    // Restricción del backend.
    if (response.status === 409) {
      return {
        success: false,
        message:
          "No se puede cambiar el estado de esta categoría. " +
          "Verifica si tiene productos publicados.",
      };
    }

    // Datos rechazados.
    if (response.status === 400) {
      return {
        success: false,
        message:
          "El backend rechazó el cambio de estado.",
      };
    }

    // Otros errores HTTP.
    if (!response.ok) {
      console.error(
        "Error al cambiar el estado de la categoría:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible modificar el estado de la categoría.",
      };
    }

    // 6. Confirmar la respuesta real de Spring Boot.
    const updatedCategory: {
      id: string;
      name: string;
      active: boolean;
    } = await response.json();

    // Validar que Spring Boot haya guardado
    // exactamente el estado solicitado.
    if (
      updatedCategory.id !== categoryId ||
      updatedCategory.active !== active
    ) {
      return {
        success: false,
        message:
          "El backend no confirmó el estado solicitado. " +
          "Actualiza la página y verifica la categoría.",
      };
    }

    return {
      success: true,
    };

  } catch (error) {
    console.error(
      "Error de conexión al modificar categoría:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo conectar con Spring Boot. " +
        "Verifica que esté ejecutándose.",
    };
  }
}
