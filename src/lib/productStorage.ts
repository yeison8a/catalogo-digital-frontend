
import { useSyncExternalStore } from "react";

import type { Product } from "@/types/product";

const STORAGE_KEY = "catalogo_custom_products";
const CHANGE_EVENT = "catalogo_products_changed";

// Obtener la información almacenada
function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

// Valor utilizado durante el renderizado del servidor
function getServerSnapshot(): string {
  return "[]";
}

// Suscribir React a los cambios del almacenamiento
function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Convertir el JSON almacenado en productos
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
        typeof item.description === "string" &&
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        typeof item.available === "boolean" &&
        typeof item.category?.id === "string" &&
        typeof item.category?.name === "string" &&
        (item.mainImageUrl === null ||
          typeof item.mainImageUrl === "string")
    );
  } catch {
    return [];
  }
}

// Hook para consultar productos almacenados
export function useStoredProducts(): Product[] {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return parseProducts(snapshot);
}

// Crear o actualizar un producto
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

// Combinar productos originales y cambios locales
export function mergeProducts(
  originalProducts: Product[],
  storedProducts: Product[]
): Product[] {
  const productMap = new Map<string, Product>();

  // Registrar primero los productos originales
  originalProducts.forEach((product) => {
    productMap.set(product.id, product);
  });

  // Sobrescribir los editados y agregar los nuevos
  storedProducts.forEach((product) => {
    productMap.set(product.id, product);
  });

  return Array.from(productMap.values());
}
