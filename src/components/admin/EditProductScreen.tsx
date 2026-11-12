
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

import ProductForm from "@/components/admin/ProductForm";

import { mockProducts } from "@/mocks/products";
import { mockCategories } from "@/mocks/categories";

import {
  useStoredProducts,
  mergeProducts,
} from "@/lib/productStorage";

export default function EditProductScreen() {
  // Obtener el ID desde la URL
  const params = useParams<{ id: string }>();
  const id = params.id;

  // Recuperar los productos guardados en el navegador
  const storedProducts = useStoredProducts();

  // Combinar originales y productos locales
  const products = mergeProducts(
    mockProducts,
    storedProducts
  );

  // Buscar el producto solicitado
  const product = products.find(
    (item) => item.id === id
  );

  // Si no existe, mostrar mensaje informativo
  if (!product) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Producto no encontrado
        </h1>

        <p className="mt-3 text-slate-600">
          No encontramos el producto que intentas editar.
        </p>

        <Link
          href="/admin/products"
          className="mt-6 inline-block font-medium text-primary hover:underline"
        >
          Volver a productos
        </Link>
      </div>
    );
  }

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
        key={JSON.stringify(product)}
        categories={mockCategories}
        initialProduct={product}
      />
    </div>
  );
}
