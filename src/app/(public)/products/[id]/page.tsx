
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductById } from "@/services/productService";
import { formatCurrency } from "@/lib/formatCurrency";
import WhatsAppButton from "@/components/products/WhatsAppButton";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <article className="grid gap-8 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2 md:p-8">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {product.mainImageUrl ? (
            <Image
              src={product.mainImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="text-center">
              <span className="text-7xl">📦</span>
              <p className="mt-3 text-sm text-slate-500">
                Imagen no disponible
              </p>
            </div>
          )}
        </div>

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

          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                product.available
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {product.available
                ? "Disponible"
                : "Agotado"}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Descripción
            </h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
              {product.description ||
                "Este producto no tiene descripción."}
            </p>
          </div>

          <div className="mt-auto pt-4">
            <WhatsAppButton product={product} />
          </div>
        </div>
      </article>
    </div>
  );
}
