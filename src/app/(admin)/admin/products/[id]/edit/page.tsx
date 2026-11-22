
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/ProductForm";

import ProductImageUploader from "@/components/admin/ProductImageUploader";

import { getAdminProductById } from "@/lib/adminProductApi";

import { getAdminCategories } from "@/lib/adminCategoryApi";

import { getProductImages } from "@/lib/productImagesApi";

import { toUiProduct } from "@/lib/productAdapter";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Recupera producto, categorías y fotografías
 * desde Spring Boot.
 */
async function EditProductContent({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const [
    apiProduct,
    categories,
    images,
  ] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
    getProductImages(id),
  ]);

  if (!apiProduct) {
    notFound();
  }

  const product = toUiProduct(
    apiProduct,
    categories
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Encabezado existente */}
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

      {/* Formulario existente */}
      <ProductForm
        key={product.id}
        categories={categories}
        initialProduct={product}
      />

      {/* Fotografías reales */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <ProductImageUploader
          productId={product.id}
          initialImages={images}
        />
      </div>
    </div>
  );
}

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
          Cargando producto y fotografías...
        </div>
      }
    >
      <EditProductContent params={params} />
    </Suspense>
  );
}
