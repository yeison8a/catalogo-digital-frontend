
import "server-only";

import {
  getCategories,
  getProducts,
} from "@/lib/catalog-api";

import {
  toUiCategory,
  toUiProducts,
} from "@/lib/productAdapter";

import type {
  Category,
  Product,
} from "@/types/product";

interface CatalogData {
  categories: Category[];
  products: Product[];
}

/**
 * Consulta los datos públicos reales y
 * los adapta a los tipos del frontend.
 *
 * Debe ejecutarse desde el servidor Next.js.
 */
export async function getCatalogData(): Promise<CatalogData> {

  const [apiCategories, apiProducts] =
    await Promise.all([
      getCategories(),
      getProducts(),
    ]);

  const categories = apiCategories.map(
    toUiCategory
  );

  const products = toUiProducts(
    apiProducts,
    apiCategories
  );

  return {
    categories,
    products,
  };
}
