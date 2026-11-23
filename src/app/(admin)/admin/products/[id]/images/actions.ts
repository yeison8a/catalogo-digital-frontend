
"use server";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080/api/v1";

const UUID_REGEX =
  /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
];

export type UploadProductImageResult =
  | {
      success: true;
      imageId: string;
      imageUrl: string;
    }
  | {
      success: false;
      message: string;
    };

/**
 * Valida una respuesta de imagen de Spring Boot.
 */
function isImageResponse(
  value: unknown
): value is {
  id: string;
  imageUrl: string;
} {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  if (
    !("id" in value) ||
    !("imageUrl" in value)
  ) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    UUID_REGEX.test(value.id) &&
    typeof value.imageUrl === "string" &&
    value.imageUrl.startsWith("https://")
  );
}

/**
 * Sube una fotografía real de un producto.
 *
 * Flujo:
 * Next.js -> Spring Boot -> Cloudinary
 *                         -> PostgreSQL
 */
export async function uploadProductImageAction(
  productId: string,
  formData: FormData
): Promise<UploadProductImageResult> {

  // Restricción temporal mientras
  // implementamos autenticación.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  // Validar el UUID del producto.
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

  // Recuperar el campo que espera Spring Boot.
  const value = formData.get("file");

  if (!(value instanceof File)) {
    return {
      success: false,
      message:
        "Debes seleccionar una fotografía válida.",
    };
  }

  // Validar que el archivo no esté vacío.
  if (value.size === 0) {
    return {
      success: false,
      message:
        "No se permiten archivos vacíos.",
    };
  }

  // Validar formatos.
  if (!ALLOWED_TYPES.includes(value.type)) {
    return {
      success: false,
      message:
        "Solo se permiten fotografías JPG o PNG.",
    };
  }

  // Validar tamaño máximo de 5 MiB.
  if (value.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message:
        "La fotografía supera el límite de 5 MiB.",
    };
  }

  try {
    // Preparar multipart/form-data.
    const uploadData = new FormData();

    uploadData.append(
      "file",
      value,
      value.name
    );

    // Enviar el archivo a Spring Boot.
    const response = await fetch(
      `${API_BASE_URL}/admin/products/${productId}/images/upload`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        body: uploadData,
      }
    );

    // Producto inexistente.
    if (response.status === 404) {
      return {
        success: false,
        message:
          "El producto no existe en PostgreSQL.",
      };
    }

    // Archivo inválido.
    if (response.status === 400) {
      return {
        success: false,
        message:
          "Spring Boot rechazó la fotografía. Comprueba que sea JPG o PNG.",
      };
    }

    // Límite de cinco fotografías.
    if (response.status === 409) {
      return {
        success: false,
        message:
          "El producto ya tiene el máximo de cinco fotografías.",
      };
    }

    // Límite de tamaño.
    if (response.status === 413) {
      return {
        success: false,
        message:
          "La fotografía supera el tamaño permitido por el servidor.",
      };
    }

    if (!response.ok) {
      console.error(
        "Error HTTP al subir fotografía:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible guardar la fotografía.",
      };
    }

    // Spring Boot responde con ProductImageResponse.
    const image: unknown = await response.json();

    if (!isImageResponse(image)) {
      return {
        success: false,
        message:
          "El servidor aceptó la fotografía, pero no se pudo confirmar su información. Revisa las imágenes del producto antes de intentar subirla nuevamente.",
      };
    }

    return {
      success: true,
      imageId: image.id,
      imageUrl: image.imageUrl,
    };

  } catch (error) {
    console.error(
      "Error enviando fotografía a Spring Boot:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo completar la carga. Verifica las fotografías existentes antes de reintentar.",
    };
  }
}


/**
 * Resultado de seleccionar una fotografía principal.
 */
export type SetMainProductImageResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

/**
 * Establece una fotografía almacenada como
 * imagen principal de un producto.
 *
 * Next.js -> Spring Boot -> PostgreSQL.
 */
export async function setMainProductImageAction(
  productId: string,
  imageId: string
): Promise<SetMainProductImageResult> {

  // Restricción temporal para desarrollo local.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  // Validar UUID del producto.
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

  // Validar UUID de la fotografía.
  if (
    typeof imageId !== "string" ||
    !UUID_REGEX.test(imageId)
  ) {
    return {
      success: false,
      message:
        "El identificador de la fotografía no es válido.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/products/${productId}/images/${imageId}/main`,
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.status === 404) {
      return {
        success: false,
        message:
          "El producto o la fotografía ya no existe.",
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message:
          "Spring Boot rechazó la fotografía seleccionada.",
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        message:
          "No es posible seleccionar esta fotografía debido a una restricción del backend.",
      };
    }

    if (!response.ok) {
      console.error(
        "Error al cambiar la imagen principal:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible cambiar la imagen principal.",
      };
    }

    // El backend confirmó una respuesta exitosa.
    // La interfaz volverá a consultar PostgreSQL.
    return {
      success: true,
    };

  } catch (error) {
    console.error(
      "Error de conexión al cambiar la imagen principal:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo confirmar el cambio. Verifica cuál fotografía es principal antes de reintentar.",
    };
  }
}


/**
 * Resultado de ordenar las fotografías.
 */
export type ReorderProductImagesResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

/**
 * Guarda el nuevo orden de las fotografías
 * mediante Spring Boot y PostgreSQL.
 *
 * imageIds debe contener todos los UUID
 * de las fotografías en el orden deseado.
 */
export async function reorderProductImagesAction(
  productId: string,
  imageIds: string[]
): Promise<ReorderProductImagesResult> {
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
      message:
        "El identificador del producto no es válido.",
    };
  }

  if (
    !Array.isArray(imageIds) ||
    imageIds.length < 1 ||
    imageIds.length > 5 ||
    !imageIds.every(
      (id) =>
        typeof id === "string" &&
        UUID_REGEX.test(id)
    )
  ) {
    return {
      success: false,
      message:
        "La lista de fotografías no es válida.",
    };
  }

  // No podemos enviar identificadores repetidos.
  if (
    new Set(imageIds).size !== imageIds.length
  ) {
    return {
      success: false,
      message:
        "La lista contiene fotografías repetidas.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/products/${productId}/images/order`,
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          imageIds,
        }),
      }
    );

    if (response.status === 404) {
      return {
        success: false,
        message:
          "El producto o alguna fotografía no existe.",
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message:
          "Spring Boot rechazó el orden. Comprueba que se incluyan todas las fotografías del producto.",
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        message:
          "No se pudo cambiar el orden por una restricción del backend.",
      };
    }

    if (!response.ok) {
      console.error(
        "Error HTTP al ordenar fotografías:",
        response.status
      );

      return {
        success: false,
        message:
          "No fue posible guardar el nuevo orden.",
      };
    }

    // El backend confirmó que la operación
    // se completó correctamente.
    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Error de conexión al ordenar fotografías:",
      error
    );

    return {
      success: false,
      message:
        "No se pudo confirmar el orden. Recarga la página y comprueba las fotografías antes de reintentar.",
    };
  }
}
