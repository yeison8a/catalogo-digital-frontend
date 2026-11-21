
import type {
  Product as ApiProduct,
  Category as ApiCategory,
} from "@/types/catalog";

import type {
  Product as UiProduct,
  Category as UiCategory,
} from "@/types/product";

/**
 * Convierte una categoría recibida desde
 * Spring Boot al modelo utilizado por Next.js.
 */
export function toUiCategory(
  category: ApiCategory
): UiCategory {
  return {
    id: category.id,
    name: category.name,
    active: category.active,
  };
}

/**
 * Convierte un producto recibido desde
 * Spring Boot al modelo del frontend.
 */
export function toUiProduct(
  product: ApiProduct,
  categories: ApiCategory[]
): UiProduct {

  // Buscar la categoría real del producto.
  const category = categories.find(
    (item) => item.id === product.categoryId
  );

  // Los endpoints públicos solo deberían
  // devolver productos con categorías activas.
  // Si falta la categoría, usamos los datos
  // de relación que devuelve ProductResponse.
  const uiCategory: UiCategory = category
    ? toUiCategory(category)
    : {
        id: product.categoryId,
        name: product.categoryName,
        active: true,
      };

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    available: product.available,
    active: product.active,
    category: uiCategory,
    mainImageUrl: product.mainImageUrl,
  };
}

/**
 * Convierte una lista completa de productos.
 */
export function toUiProducts(
  products: ApiProduct[],
  categories: ApiCategory[]
): UiProduct[] {
  return products.map((product) =>
    toUiProduct(product, categories)
  );
}
