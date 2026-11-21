
import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";

import {
  getCategories,
  getProducts,
} from "@/lib/catalog-api";

import type {
  Category,
  Product,
} from "@/types/catalog";

// Formatear precios en pesos colombianos.
const priceFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/**
 * Consulta la información real de Spring Boot.
 *
 * Se ejecuta dentro de Suspense para permitir
 * la carga dinámica con Cache Components.
 */
async function ComprobacionApiContent() {
  let categories: Category[] = [];
  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    const [categoriesResponse, productsResponse] =
      await Promise.all([
        getCategories(),
        getProducts(),
      ]);

    categories = categoriesResponse;
    products = productsResponse;
  } catch (error) {
    // No interceptar errores internos de Next.js
    // relacionados con la renderización.
    unstable_rethrow(error);

    console.error(
      "Error consultando Spring Boot:",
      error
    );

    errorMessage =
      "No se pudo conectar con la API de Spring Boot. " +
      "Verifica que el backend esté ejecutándose.";
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        {errorMessage}
      </div>
    );
  }

  return (
    <>
      {/* Resumen */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Categorías activas
          </p>

          <p className="mt-2 text-3xl font-bold">
            {categories.length}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Productos publicados
          </p>

          <p className="mt-2 text-3xl font-bold">
            {products.length}
          </p>
        </div>
      </div>

      {/* Categorías */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">
          Categorías
        </h2>

        {categories.length === 0 ? (
          <p>No existen categorías activas.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border px-4 py-2 text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Productos */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Productos
        </h2>

        {products.length === 0 ? (
          <p>No existen productos publicados.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-xl border p-5"
              >
                <h3 className="text-lg font-semibold">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {product.categoryName}
                </p>

                <p className="mt-3 font-bold">
                  {priceFormatter.format(product.price)}
                </p>

                <p className="mt-2 text-sm">
                  {product.available
                    ? "Disponible"
                    : "Agotado"}
                </p>

                {product.description && (
                  <p className="mt-3 text-sm text-gray-600">
                    {product.description}
                  </p>
                )}

                {product.mainImageUrl && (
                  <a
                    href={product.mainImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm text-blue-600 underline"
                  >
                    Ver fotografía real
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/**
 * Página de comprobación de API.
 *
 * El encabezado se muestra inmediatamente.
 * La consulta HTTP se ejecuta dentro de Suspense.
 */
export default function ComprobacionApiPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-2 text-3xl font-bold">
        Comprobación de API
      </h1>

      <p className="mb-8 text-gray-600">
        Datos reales de Spring Boot y PostgreSQL
      </p>

      <Suspense
        fallback={
          <div className="rounded-xl border bg-white p-6">
            <p className="font-medium text-slate-800">
              Consultando Spring Boot...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Cargando categorías y productos reales.
            </p>
          </div>
        }
      >
        <ComprobacionApiContent />
      </Suspense>
    </main>
  );
}
