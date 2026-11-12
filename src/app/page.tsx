
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold text-primary">
            Bienvenido a nuestra tienda
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Encuentra lo que necesitas en un solo lugar
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Explora nuestra variedad de productos,
            descubre nuevas opciones y consulta
            fácilmente por WhatsApp.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">
          Nuestros productos
        </h2>

        <p className="mt-2 text-slate-600">
          Próximamente encontrarás aquí todos
          nuestros productos disponibles.
        </p>
      </section>
    </div>
  );
}
