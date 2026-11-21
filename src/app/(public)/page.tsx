
import { Suspense } from "react";

import ProductCatalog from "@/components/products/ProductCatalog";
import { getCatalogData } from "@/lib/catalogService";

// Este componente consulta los datos reales.
async function CatalogContent() {
  const { categories, products } = await getCatalogData();

  return (
    <ProductCatalog
      products={products}
      categories={categories}
    />
  );
}

// Página principal
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      {/* Presentación de la tienda */}
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold text-primary">
            Bienvenido a nuestra tienda
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Encuentra lo que necesitas en un solo lugar
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Explora nuestra variedad de productos
            y encuentra fácilmente lo que buscas.
          </p>
        </div>
      </section>

      {/* Catálogo real */}
      <section className="mt-10">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Nuestros productos
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Descubre todos nuestros artículos.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-lg font-medium text-slate-800">
                Cargando productos...
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Estamos consultando nuestro catálogo.
              </p>
            </div>
          }
        >
          <CatalogContent />
        </Suspense>

      </section>

    </div>
  );
}
