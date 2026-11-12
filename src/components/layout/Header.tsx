
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold text-slate-900"
        >
          Mi Tienda
        </Link>

        <nav aria-label="Navegación principal">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            Productos
          </Link>
        </nav>
      </div>
    </header>
  );
}
