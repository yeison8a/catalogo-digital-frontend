
"use client";

import { useState } from "react";

import type { Product, Category } from "@/types/product";
import { normalizeText } from "@/lib/normalizeText";

import ProductSearch from "./ProductSearch";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
}

export default function ProductCatalog({
  products,
  categories,
}: ProductCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | null
  >(null);

  const normalizedSearch = normalizeText(search);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = normalizeText(product.name).includes(
      normalizedSearch
    );

    const matchesCategory =
      selectedCategory === null ||
      product.category.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const hasActiveFilters =
    search.trim() !== "" || selectedCategory !== null;

  function clearFilters() {
    setSearch("");
    setSelectedCategory(null);
  }

  return (
    <div className="space-y-5">
      <ProductSearch
        value={search}
        onChange={setSearch}
      />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="flex items-center justify-between gap-3">
        <p
          className="text-sm text-slate-500"
          role="status"
          aria-live="polite"
        >
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "producto encontrado"
            : "productos encontrados"}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-xl bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No encontramos productos
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Prueba con otra búsqueda o categoría.
          </p>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
