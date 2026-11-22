
"use server";

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
 * Esta operación se utiliza solamente en
 * el entorno de desarrollo local.
 */
export async function createProductAction(
  input: CreateProductInput
): Promise<CreateProductResult> {

  // Todavía no tenemos autenticación.
  // Impedir operaciones administrativas
  // desde una compilación de producción.
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message:
        "La administración solo está habilitada en desarrollo local.",
    };
  }

  // Validar que los datos sean correctos.
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

  // Validar precio.
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

    // Enviar el producto a Spring Boot.
    const response = await fetch(
      `${API_BASE_URL}/admin/products`,
      {
        method: "POST",
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

    // Categoría inexistente o inválida.
    if (response.status === 404) {
      return {
        success: false,
        message:
          "La categoría seleccionada no existe.",
      };
    }

    // Datos rechazados por el backend.
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

    // Obtener el UUID real generado
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
