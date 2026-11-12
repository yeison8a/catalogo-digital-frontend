
import { useSyncExternalStore } from "react";
import type { Category } from "@/types/product";

const STORAGE_KEY = "catalogo_custom_categories";
const CHANGE_EVENT = "catalogo_categories_changed";

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function parseCategories(value: string): Category[] {
  try {
    const data: unknown = JSON.parse(value);

    if (!Array.isArray(data)) return [];

    return data.filter(
      (item): item is Category =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.active === "boolean"
    );
  } catch {
    return [];
  }
}

export function useStoredCategories(): Category[] {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return parseCategories(snapshot);
}

export function saveCategory(category: Category): void {
  const categories = parseCategories(getSnapshot());

  const exists = categories.some(
    (item) => item.id === category.id
  );

  const updated = exists
    ? categories.map((item) =>
        item.id === category.id ? category : item
      )
    : [...categories, category];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function mergeCategories(
  original: Category[],
  stored: Category[]
): Category[] {
  const categoryMap = new Map<string, Category>();

  original.forEach((category) => {
    categoryMap.set(category.id, category);
  });

  stored.forEach((category) => {
    categoryMap.set(category.id, category);
  });

  return Array.from(categoryMap.values());
}
