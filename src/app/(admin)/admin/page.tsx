
import Link from "next/link";

import { mockProducts } from "@/mocks/products";
import { mockCategories } from "@/mocks/categories";

export default function AdminDashboardPage() {
  const totalProducts = mockProducts.length;

  const availableProducts = mockProducts.filter(
    (product) => product.available
  ).length;

  const unavailableProducts =
    totalProducts - availableProducts;

  const totalCategories = mockCategories.length;

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
