
import CategoryManager from "@/components/admin/CategoryManager";

import { mockCategories } from "@/mocks/categories";
import { mockProducts } from "@/mocks/products";

export default function AdminCategoriesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Gestión de categorías
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Crea, modifica y organiza las categorías
          de tu catálogo digital.
        </p>
      </header>

      <CategoryManager
        initialCategories={mockCategories}
        initialProducts={mockProducts}
      />
    </div>
  );
}
