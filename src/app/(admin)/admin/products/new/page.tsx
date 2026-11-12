
import Link from "next/link";

import ProductForm from "@/components/admin/ProductForm";
import { mockCategories } from "@/mocks/categories";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Volver a productos
        </Link>

        <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
          Registrar producto
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Completa la información del nuevo producto.
        </p>
      </div>

      <ProductForm categories={mockCategories} />
    </div>
  );
}
