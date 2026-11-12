
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl">📦</span>

      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        Producto no encontrado
      </h1>

      <p className="mt-3 text-slate-600">
        El producto que buscas no existe
        o ya no está disponible en nuestro catálogo.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Volver al catálogo
      </Link>
    </section>
  );
}
