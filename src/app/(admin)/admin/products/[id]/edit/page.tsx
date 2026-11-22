
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/ProductForm";

import { getAdminProductById } from "@/lib/adminProductApi";
import { getAdminCategories } from "@/lib/adminCategoryApi";
import { toUiProduct } from "@/lib/productAdapter";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Consulta la información real del producto
 * y las categorías disponibles desde Spring Boot.
 */
async function EditProductContent({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const [apiProduct, categories] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
  ]);

  if (!apiProduct) {
    notFound();
  }

  // Adaptar la respuesta de Spring Boot
  // al modelo utilizado por ProductForm.
  const product = toUiProduct(
    apiProduct,
    categories
  );

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
          Editar producto
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Modifica la información de {product.name}.
        </p>
      </div>

      <ProductForm
        key={product.id}
        categories={categories}
        initialProduct={product}
      />
    </div>
  );
}

/**
 * Suspense permite consultar datos dinámicos
 * con Cache Components habilitado.
 */
export default function EditProductPage({
  params,
}: EditProductPageProps) {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto max-w-3xl py-12 text-center text-slate-600"
          role="status"
        >
          Cargando producto desde PostgreSQL...
        </div>
      }
    >
      <EditProductContent params={params} />
    </Suspense>
  );
}
