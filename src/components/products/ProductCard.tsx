
import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/formatCurrency";

interface ProductCardProps {
  product: Product;
}

const categoryIcons: Record<string, string> = {
  Tecnología: "🎧",
  Accesorios: "👜",
  Hogar: "🏠",
  Deportes: "⚽",
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      aria-label={`Ver detalles de ${product.name}`}
      className="group block h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* Imagen del producto */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-100">
        {product.mainImageUrl ? (
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            className="text-6xl"
            role="img"
            aria-label="Imagen no disponible"
          >
            {categoryIcons[product.category.name] ?? "📦"}
          </span>
        )}

        {/* Indicador de agotado */}
        {!product.available && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
            Agotado
          </span>
        )}
      </div>

      {/* Información del producto */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        {/* Categoría */}
        <span className="text-xs font-medium text-slate-500">
          {product.category.name}
        </span>

        {/* Nombre */}
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900 sm:text-base">
          {product.name}
        </h3>

        {/* Precio */}
        <p className="text-lg font-bold text-slate-900">
          {formatCurrency(product.price)}
        </p>

        {/* Disponibilidad */}
        <span
          className={`text-xs font-medium ${
            product.available
              ? "text-green-700"
              : "text-red-600"
          }`}
        >
          {product.available ? "Disponible" : "No disponible"}
        </span>

        {/* Enlace visual al detalle */}
        <span className="mt-2 text-sm font-semibold text-primary group-hover:underline">
          Ver producto →
        </span>
      </div>
    </Link>
  );
}
