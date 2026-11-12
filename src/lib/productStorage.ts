
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

    return data.filter(
      (item): item is Product =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.available === "boolean" &&
        typeof item.description === "string" &&
        typeof item.category?.id === "string" &&
        typeof item.category?.name === "string"
    );
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

  const updatedProducts = [...products, product];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedProducts)
  );

  window.dispatchEvent(new Event(CHANGE_EVENT));
}
