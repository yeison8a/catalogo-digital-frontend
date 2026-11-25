
import Link from "next/link";

import {
  logoutAdminAction,
} from "@/lib/auth/admin-logout-actions";

export default function AdminHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

        {/* Identidad del panel */}
        <Link
          href="/admin"
          className="text-xl font-bold text-slate-900"
        >
          Administración
        </Link>

        {/* Navegación administrativa */}
        <nav
          aria-label="Navegación administrativa"
          className="flex flex-wrap items-center gap-4 text-sm font-medium"
        >

          {/* Dashboard */}
          <Link
            href="/admin"
            className="text-slate-600 hover:text-primary"
          >
            Inicio
          </Link>

          {/* Productos */}
          <Link
            href="/admin/products"
            className="text-slate-600 hover:text-primary"
          >
            Productos
          </Link>

          {/* Categorías */}
          <Link
            href="/admin/categories"
            className="text-slate-600 hover:text-primary"
          >
            Categorías
          </Link>

          {/* Tienda pública en otra pestaña */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver tienda en una pestaña nueva"
            title="Abrir tienda en una pestaña nueva"
            className="text-primary hover:underline"
          >
            Ver tienda
          </Link>

          {/* Cerrar sesión administrativa */}
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Cerrar sesión
            </button>
          </form>

        </nav>
      </div>
    </header>
  );
}
