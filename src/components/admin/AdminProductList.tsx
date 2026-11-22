
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

  // Estado del buscador.
  const [search, setSearch] = useState("");

  // Estado del filtro de disponibilidad.
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");

  // Datos reales proporcionados por Spring Boot.
  // No utilizamos localStorage ni mockProducts.
  const allProducts = products;

  // Normalizar el texto de búsqueda.
  const normalizedSearch = normalizeText(search);

  // Filtrar productos por nombre y disponibilidad.
  const filteredProducts = allProducts.filter(
    (product) => {
      const matchesSearch = normalizeText(
        product.name
      ).includes(normalizedSearch);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (
          availabilityFilter === "available" &&
          product.available
        ) ||
        (
          availabilityFilter === "unavailable" &&
          !product.available
        );

      return matchesSearch && matchesAvailability;
    }
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    availabilityFilter !== "all";

  // Restablecer los filtros.
  function clearFilters() {
    setSearch("");
    setAvailabilityFilter("all");
  }

  return (
    <section className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Productos registrados
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {allProducts.length}{" "}
            {allProducts.length === 1
              ? "producto en el catálogo"
              : "productos en el catálogo"}
          </p>
        </div>

        {/* La creación se conectará en el paso 44.4 */}
        <Link
  href="/admin/products/new"
  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
>
  + Nuevo producto
</Link>

      </div>

      {/* Buscador y filtro */}
      <div className="flex flex-col gap-3 sm:flex-row">

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar producto..."
          aria-label="Buscar productos"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 sm:flex-1"
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

      {/* Contador y limpieza de filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">

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
            className="text-sm font-medium text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        )}

      </div>

      {/* Listado real de productos */}
      {filteredProducts.length === 0 ? (

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

          <h3 className="font-semibold text-slate-900">
            No se encontraron productos
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {allProducts.length === 0
              ? "No hay productos registrados en PostgreSQL."
              : "Intenta con otro nombre o cambia el filtro de disponibilidad."}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Mostrar todos los productos
            </button>
          )}

        </div>

      ) : (

        <div className="space-y-3">

          {filteredProducts.map((product) => (

            <article
              key={product.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >

              {/* Información del producto */}
              <div className="min-w-0 flex-1">

                <h3 className="break-words font-semibold text-slate-900">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {product.category.name}
                </p>

                <p className="mt-2 font-bold text-slate-900">
                  {formatCurrency(product.price)}
                </p>

                {/* Disponibilidad */}
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

              {/* Estado de publicación */}
              <div className="w-full space-y-3 border-t border-slate-100 pt-3 sm:w-48 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">

                <p className="text-xs font-medium text-slate-500">
                  Estado de publicación
                </p>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    product.active
                      ? "bg-blue-50 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {product.active
                    ? "Publicado"
                    : "Oculto"}
                </span>

                <p className="text-xs text-slate-400">
                  Los cambios de estado se habilitarán
                  al integrar las operaciones del backend.
                </p>

              </div>

              {/* Acciones */}
              <div className="flex flex-wrap items-center gap-2">

                {product.active && product.category.active ? (
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Ver
                  </Link>
                ) : (
                  <span
                    title="El producto no está visible en el catálogo público"
                    className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
                  >
                    Ver
                  </span>
                )}

                {/* Edición pendiente de integración */}
                <span
                  aria-disabled="true"
                  title="La edición se conectará con Spring Boot en un siguiente paso"
                  className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-lg bg-slate-300 px-4 py-2 text-sm font-medium text-white"
                >
                  Editar
                </span>

              </div>

            </article>

          ))}

        </div>

      )}

    </section>
  );
}
