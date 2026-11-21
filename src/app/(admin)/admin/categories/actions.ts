
"use server";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

export type CreateCategoryResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Crea una categoría real en PostgreSQL
 * mediante el backend Spring Boot.
 *
 * Disponible únicamente en desarrollo local.
 */
export async function createCategoryAction(
  name: string
): Promise<CreateCategoryResult> {
  // No habilitar operaciones administrativas
  // sin autenticación en producción.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  if (typeof name !== "string") {
    return {
      success: false,
      message: "El nombre de la categoría no es válido.",
    };
  }

  const cleanName = name.trim();

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
    const response = await fetch(
      `${API_BASE_URL}/admin/categories`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      }
    );

    if (response.status === 409) {
      return {
        success: false,
        message:
          "Ya existe una categoría con ese nombre.",
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message:
          "El nombre de la categoría no cumple las validaciones.",
      };
    }

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


export type UpdateCategoryResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Actualiza el nombre de una categoría
 * existente en PostgreSQL.
 */
export async function updateCategoryAction(
  categoryId: string,
  name: string
): Promise<UpdateCategoryResult> {
  // Mantener la restricción de desarrollo local.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  if (
    typeof categoryId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      categoryId
    )
  ) {
    return {
      success: false,
      message: "El identificador de la categoría no es válido.",
    };
  }

  if (typeof name !== "string") {
    return {
      success: false,
      message: "El nombre de la categoría no es válido.",
    };
  }

  const cleanName = name.trim();

  if (cleanName.length < 2 || cleanName.length > 100) {
    return {
      success: false,
      message:
        "El nombre debe tener entre 2 y 100 caracteres.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/categories/${categoryId}`,
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      }
    );

    if (response.status === 404) {
      return {
        success: false,
        message: "La categoría ya no existe.",
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        message:
          "Ya existe otra categoría con ese nombre.",
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message:
          "Los datos enviados no cumplen las validaciones del backend.",
      };
    }

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


export type UpdateCategoryStatusResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Activa o desactiva una categoría en PostgreSQL
 * mediante el endpoint administrativo de Spring Boot.
 */
export async function updateCategoryStatusAction(
  categoryId: string,
  active: boolean
): Promise<UpdateCategoryStatusResult> {
  // Mantener la restricción actual del panel local.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  // Validar que el identificador tenga formato UUID.
  if (
    typeof categoryId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      categoryId
    )
  ) {
    return {
      success: false,
      message: "El identificador de la categoría no es válido.",
    };
  }

  if (typeof active !== "boolean") {
    return {
      success: false,
      message: "El estado enviado no es válido.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/categories/${categoryId}/status`,
      {
        method: "PATCH",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          active,
        }),
      }
    );

    if (response.status === 404) {
      return {
        success: false,
        message: "La categoría ya no existe.",
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        message:
          "No se puede cambiar el estado de esta categoría. " +
          "Verifica si tiene productos publicados.",
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message:
          "El backend rechazó el cambio de estado.",
      };
    }

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

    // Verificar la respuesta real del backend.
    const updatedCategory: {
      id: string;
      name: string;
      active: boolean;
    } = await response.json();

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
