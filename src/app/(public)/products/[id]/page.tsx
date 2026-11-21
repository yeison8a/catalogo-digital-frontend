
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductById } from "@/services/productService";
import { getProductImages } from "@/lib/productImagesApi";
import { formatCurrency } from "@/lib/formatCurrency";

import ProductGallery from "@/components/products/ProductGallery";
import WhatsAppButton from "@/components/products/WhatsAppButton";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Consulta el producto y sus fotografías
 * desde Spring Boot.
 */
async function ProductDetailContent({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  // Primero verificamos que el producto existe.
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Consultar las fotografías del producto.
  const images = await getProductImages(id);

  return (
    <article className="grid gap-8 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2 md:p-8">

      {/* Galería de fotografías reales */}
      <ProductGallery
        productName={product.name}
        images={images}
        mainImageUrl={product.mainImageUrl}
      />

      {/* Información del producto */}
      <div className="flex flex-col gap-5">

        <div>
          <span className="text-sm font-medium text-primary">
            {product.category.name}
          </span>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* Disponibilidad */}
        <div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              product.available
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {product.available ? "Disponible" : "Agotado"}
          </span>
        </div>

        {/* Descripción */}
        <div className="border-t border-slate-200 pt-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Descripción
          </h2>

          <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
            {product.description ||
              "Este producto no tiene descripción."}
          </p>
        </div>

        {/* Botón de WhatsApp */}
        <div className="mt-auto pt-4">
          <WhatsAppButton product={product} />
        </div>

      </div>
    </article>
  );
}

/**
 * Página de detalle del producto.
 *
 * Suspense permite consultar datos dinámicos
 * sin bloquear la renderización inicial.
 */
export default function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <Suspense
        fallback={
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-6 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">

              <div className="aspect-square rounded-xl bg-slate-200" />

              <div className="space-y-5">
                <div className="h-5 w-28 rounded bg-slate-200" />
                <div className="h-8 w-3/4 rounded bg-slate-200" />
                <div className="h-9 w-40 rounded bg-slate-200" />
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="h-24 rounded bg-slate-200" />
              </div>

            </div>
          </div>
        }
      >
        <ProductDetailContent params={params} />
      </Suspense>

    </div>
  );
}
