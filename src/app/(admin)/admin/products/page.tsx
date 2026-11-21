
import { Suspense } from "react";

import AdminProductList from "@/components/admin/AdminProductList";

import { getAdminProducts } from "@/lib/adminProductApi";
import { getAdminCategories } from "@/lib/adminCategoryApi";
import { toUiProducts } from "@/lib/productAdapter";

/**
 * Consulta los productos y categorías reales
 * de PostgreSQL mediante Spring Boot.
 */
async function AdminProductsContent() {
  const [apiProducts, apiCategories] =
    await Promise.all([
      getAdminProducts(),
      getAdminCategories(),
    ]);

  // Convertir los productos al modelo utilizado
  // por nuestros componentes de Next.js.
  const products = toUiProducts(
    apiProducts,
    apiCategories
  );

  return <AdminProductList products={products} />;
}

/**
 * Página administrativa de productos.
 */
export default function AdminProductsPage() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Gestión de productos
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Consulta y administra los productos
          registrados en tu catálogo.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="font-medium text-slate-800">
                Cargando productos...
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Consultando Spring Boot y PostgreSQL.
              </p>
            </div>

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-32 rounded bg-slate-100" />
                <div className="mt-4 h-6 w-24 rounded bg-slate-200" />
              </div>
            ))}

          </div>
        }
      >
        <AdminProductsContent />
      </Suspense>

    </div>
  );
}
