
import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link
          href="/admin"
          className="text-xl font-bold text-slate-900"
        >
          Administración
        </Link>

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

          <Link
            href="/"
            className="text-primary hover:underline"
          >
            Ver tienda
          </Link>
        </nav>
      </div>
    </header>
  );
}
