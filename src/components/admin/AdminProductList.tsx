
"use client";

import { useState } from "react";
import Link from "next/link";

import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/formatCurrency";
import { normalizeText } from "@/lib/normalizeText";

interface AdminProductListProps {
  products: Product[];
}

type AvailabilityFilter =
  | "all"
  | "available"
  | "unavailable";

export default function AdminProductList({
  products,
}: AdminProductListProps) {
  const [search, setSearch] = useState("");

  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = normalizeText(
      product.name
    ).includes(normalizeText(search));

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" &&
        product.available) ||
      (availabilityFilter === "unavailable" &&
        !product.available);

    return matchesSearch && matchesAvailability;
  });

  return (
    <section className="space-y-6">
      {/* Acciones principales */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Productos registrados
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {products.length} productos en el catálogo
          </p>
        </div>

        <button
          type="button"
          disabled
          title="Disponible en el próximo paso"
          className="cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 text-sm font-semibold text-white"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar producto..."
          aria-label="Buscar productos"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 sm:flex-1"
        />

        <select
          value={availabilityFilter}
          onChange={(event) =>
            setAvailabilityFilter(
              event.target.value as AvailabilityFilter
            )
          }
          aria-label="Filtrar por disponibilidad"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary sm:w-52"
        >
          <option value="all">Todos</option>
          <option value="available">Disponibles</option>
          <option value="unavailable">Agotados</option>
        </select>
      </div>

      {/* Contador de resultados */}
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

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="font-semibold text-slate-900">
            No se encontraron productos
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Prueba con otra búsqueda o filtro.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Información */}
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {product.category.name}
                </p>

                <p className="mt-2 font-bold text-slate-900">
                  {formatCurrency(product.price)}
                </p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    product.available
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.available
                    ? "Disponible"
                    : "Agotado"}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${product.id}`}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Ver
                </Link>

                <button
                  type="button"
                  disabled
                  title="La edición se implementará posteriormente"
                  className="cursor-not-allowed rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
                >
                  Editar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
