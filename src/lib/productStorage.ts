
import { useSyncExternalStore } from "react";
import type { Product } from "@/types/product";

const STORAGE_KEY = "catalogo_custom_products";
const CHANGE_EVENT = "catalogo_products_changed";

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function parseProducts(value: string): Product[] {
  try {
    const data: unknown = JSON.parse(value);

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.description === "string" &&
          typeof item.price === "number" &&
          Number.isFinite(item.price) &&
          typeof item.available === "boolean" &&
          typeof item.category?.id === "string" &&
          typeof item.category?.name === "string" &&
          (item.mainImageUrl === null ||
            typeof item.mainImageUrl === "string") &&
          (item.active === undefined ||
            typeof item.active === "boolean")
      )
      .map((item) => ({
        ...item,
        active: item.active ?? true,
      })) as Product[];
  } catch {
    return [];
  }
}

export function useStoredProducts(): Product[] {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return parseProducts(snapshot);
}

export function saveProduct(product: Product): void {
  const products = parseProducts(getSnapshot());

  const productExists = products.some(
    (item) => item.id === product.id
  );

  const updatedProducts = productExists
    ? products.map((item) =>
        item.id === product.id ? product : item
      )
    : [...products, product];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedProducts)
  );

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function mergeProducts(
  originalProducts: Product[],
  storedProducts: Product[]
): Product[] {
  const productMap = new Map<string, Product>();

  originalProducts.forEach((product) => {
    productMap.set(product.id, product);
  });

  storedProducts.forEach((product) => {
    productMap.set(product.id, product);
  });

  return Array.from(productMap.values());
}
