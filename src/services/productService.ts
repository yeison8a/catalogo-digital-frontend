
import type { Product } from "@/types/product";
import { mockProducts } from "@/mocks/products";

export async function getProductById(
  id: string
): Promise<Product | null> {
  const product = mockProducts.find(
    (product) => product.id === id
  );

  return product ?? null;
}
