
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
