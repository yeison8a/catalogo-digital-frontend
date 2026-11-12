
import Image from "next/image";

import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/formatCurrency";

interface ProductCardProps {
  product: Product;
}

const categoryIcons: Record<string, string> = {
  Tecnología: "🎧",
  Accesorios: "👜",
  Hogar: "🏠",
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative flex aspect-square items-center justify-center bg-slate-100">
        {product.mainImageUrl ? (
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
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
      </div>

      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <span className="text-xs text-slate-500">
          {product.category.name}
        </span>

        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900 sm:text-base">
          {product.name}
        </h3>

        <p className="text-lg font-bold text-slate-900">
          {formatCurrency(product.price)}
        </p>

        <span
          className={
            product.available
              ? "text-xs font-medium text-green-700"
              : "text-xs font-medium text-red-600"
          }
        >
          {product.available ? "Disponible" : "Agotado"}
        </span>
      </div>
    </article>
  );
}
