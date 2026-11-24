
import { Suspense } from "react";
import Link from "next/link";

import { getAdminProducts } from "@/lib/adminProductApi";
import { getAdminCategories } from "@/lib/adminCategoryApi";

import {
  requireAdminSession,
} from "@/lib/auth/require-admin-session";

/**
 * Dashboard conectado con Spring Boot.
 *
 * Los indicadores se calculan usando
 * información real de PostgreSQL.
 *
 * Antes de realizar cualquier consulta,
 * comprobamos que el administrador tenga
 * una sesión válida y autorizada.
 */
async function AdminDashboardContent() {

  // 1. Verificar la sesión del administrador.
  //
  // Si no existe sesión o Spring Boot rechaza
  // el JWT, Next.js redirige a /admin/login.
  //
  // Esta verificación ocurre antes de consultar
  // productos y categorías.
  await requireAdminSession();

  // 2. Consultar productos y categorías en paralelo.
  //
  // Solamente llegamos aquí cuando la sesión
  // ha sido autorizada por Spring Boot.
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  // 3. Total de productos registrados.
  const totalProducts = products.length;

  // 4. Productos disponibles.
  const availableProducts = products.filter(
    (product) => product.available
  ).length;

  // 5. Productos agotados o no disponibles.
  const unavailableProducts =
    totalProducts - availableProducts;

  // 6. Total de categorías registradas.
  const totalCategories = categories.length;

  // 7. Indicadores del dashboard.
  const stats = [
    {
      title: "Total de productos",
      value: totalProducts,
    },
    {
      title: "Disponibles",
      value: availableProducts,
    },
    {
      title: "Agotados",
      value: unavailableProducts,
    },
    {
      title: "Categorías",
      value: totalCategories,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Panel de administración
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Consulta y administra la información
          de tu catálogo digital.
        </p>
      </section>

      {/* Estadísticas */}
      <section aria-labelledby="stats-title">
        <h2
          id="stats-title"
          className="mb-4 text-lg font-semibold text-slate-900"
        >
          Resumen del catálogo
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {stats.map((stat) => (
            <article
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <p className="text-sm text-slate-500">
                {stat.title}
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Accesos rápidos */}
      <section aria-labelledby="actions-title">
        <h2
          id="actions-title"
          className="mb-4 text-lg font-semibold text-slate-900"
        >
          Accesos rápidos
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Gestionar productos
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Consulta, agrega y modifica
              los productos del catálogo.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-primary">
              Ir a productos →
            </span>
          </Link>

          <Link
            href="/admin/categories"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Gestionar categorías
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Organiza los productos
              mediante categorías.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-primary">
              Ir a categorías →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

/**
 * Suspense permite realizar las consultas
 * dinámicas sin interferir con la configuración
 * cacheComponents de Next.js.
 *
 * La validación de sesión también se ejecuta
 * dentro del componente asíncrono.
 */
export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="py-12 text-center text-sm text-slate-600"
        >
          Cargando información del catálogo...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
