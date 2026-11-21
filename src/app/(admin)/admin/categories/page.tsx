
import { Suspense } from "react";

import { getAdminCategories } from "@/lib/adminCategoryApi";
import AdminCategoryCreateForm from "@/components/admin/AdminCategoryCreateForm";
import AdminCategoryEdit from "@/components/admin/AdminCategoryEdit";
import AdminCategoryStatus from "@/components/admin/AdminCategoryStatus";

/**
 * Consulta las categorías reales desde Spring Boot.
 *
 * Este componente es de servidor.
 */
async function AdminCategoriesContent() {
  const categories = await getAdminCategories();

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Categorías registradas ({categories.length})
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Información obtenida desde PostgreSQL.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">
            No hay categorías registradas en la base de datos.
          </p>
        </div>
      ) : (
        categories.map((category) => (
          <article
            key={category.id}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {category.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Categoría registrada en PostgreSQL
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  category.active
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {category.active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="flex flex-wrap items-start gap-3 border-t border-slate-100 pt-3">
              <AdminCategoryEdit category={category} />

              <AdminCategoryStatus category={category} />
            </div>
          </article>
        ))
      )}

      <p className="text-sm text-slate-500">
        La creación, edición y activación de categorías
        se habilitarán cuando conectemos los formularios
        con Spring Boot.
      </p>
    </section>
  );
}

/**
 * Página administrativa de categorías.
 */
export default function AdminCategoriesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Gestión de categorías
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Crea, modifica y organiza las categorías
          de tu catálogo digital.
        </p>
      </header>

      <AdminCategoryCreateForm />

      <Suspense
        fallback={
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Cargando categorías desde Spring Boot...
            </p>

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-60 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        }
      >
        <AdminCategoriesContent />
      </Suspense>
    </div>
  );
}
