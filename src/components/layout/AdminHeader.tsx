
import Link from "next/link";

/**
 * Encabezado del panel administrativo.
 *
 * Permite navegar entre las secciones
 * administrativas y abrir la tienda pública
 * en una pestaña independiente.
 */
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
          <Link
            href="/admin"
            className="text-slate-600 hover:text-primary"
          >
            Inicio
          </Link>

          <Link
            href="/admin/products"
            className="text-slate-600 hover:text-primary"
          >
            Productos
          </Link>

          <Link
            href="/admin/categories"
            className="text-slate-600 hover:text-primary"
          >
            Categorías
          </Link>

          {/* Abrir tienda pública sin abandonar el panel */}
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
        </nav>
      </div>
    </header>
  );
}
