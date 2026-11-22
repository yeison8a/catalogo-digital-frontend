
import { Suspense } from "react";
import Link from "next/link";

import ProductForm from "@/components/admin/ProductForm";
import { getAdminCategories } from "@/lib/adminCategoryApi";

/**
 * Obtiene las categorías administrativas reales
 * y las entrega al formulario.
 */
async function NewProductContent() {
  const categories = await getAdminCategories();

  return <ProductForm categories={categories} />;
}

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Volver a productos
        </Link>

        <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
          Registrar producto
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Completa la información del nuevo producto.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="font-medium text-slate-800">
              Cargando formulario...
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Consultando categorías desde PostgreSQL.
            </p>
          </div>
        }
      >
        <NewProductContent />
      </Suspense>
    </div>
  );
}
