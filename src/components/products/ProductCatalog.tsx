
"use client";

import { useState } from "react";

import type { Product } from "@/types/product";
import { normalizeText } from "@/lib/normalizeText";

import ProductSearch from "./ProductSearch";
import ProductGrid from "./ProductGrid";

interface ProductCatalogProps {
  products: Product[];
}

export default function ProductCatalog({
  products,
}: ProductCatalogProps) {
  const [search, setSearch] = useState("");

  const normalizedSearch = normalizeText(search);

  const filteredProducts = products.filter((product) =>
    normalizeText(product.name).includes(normalizedSearch)
  );

  return (
    <div className="space-y-6">
      <ProductSearch
        value={search}
        onChange={setSearch}
      />

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

      {filteredProducts.length === 0 ? (
        <div className="rounded-xl bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No encontramos productos
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Intenta buscar con otro nombre.
          </p>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
