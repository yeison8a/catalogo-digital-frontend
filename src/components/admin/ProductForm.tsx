

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { Category, Product } from "@/types/product";
import { saveProduct } from "@/lib/productStorage";

interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product;
}

interface FormValues {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  available: boolean;
}

export default function ProductForm({
  categories,
  initialProduct,
}: ProductFormProps) {
  const router = useRouter();

  // Si existe initialProduct, estamos editando
  const isEditing = Boolean(initialProduct);

  const [form, setForm] = useState<FormValues>({
    name: initialProduct?.name ?? "",
    description: initialProduct?.description ?? "",
    price: initialProduct
      ? String(initialProduct.price)
      : "",
    categoryId: initialProduct?.category.id ?? "",
    available: initialProduct?.available ?? true,
  });

  const [error, setError] = useState("");

  // Actualizar los valores del formulario
  function updateField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  // Procesar creación o edición
  function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const price = Number(form.price);

    const category = categories.find(
      (item) => item.id === form.categoryId
    );

    if (name.length < 3 || name.length > 150) {
      setError(
        "El nombre debe tener entre 3 y 150 caracteres."
      );
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(price) ||
      price > 9999999999
    ) {
      setError("Ingresa un precio válido en COP.");
      return;
    }

    if (!category) {
      setError("Selecciona una categoría válida.");
      return;
    }

    const product: Product = {
        id: initialProduct?.id ?? crypto.randomUUID(),
        name,
        description: form.description.trim(),
        price,
        available: form.available,
        active: initialProduct?.active ?? true,
        category,
        mainImageUrl: initialProduct?.mainImageUrl ?? null,
    };

    try {
      saveProduct(product);

      router.push("/admin/products");
    } catch {
      setError(
        "No fue posible guardar los cambios."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {isEditing
            ? "Editar información"
            : "Información del producto"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Los campos marcados con * son obligatorios.
        </p>
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium"
        >
          Nombre del producto *
        </label>

        <input
          id="name"
          type="text"
          required
          minLength={3}
          maxLength={150}
          value={form.name}
          onChange={(event) =>
            updateField("name", event.target.value)
          }
          placeholder="Ej. Audífonos inalámbricos"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium"
        >
          Descripción
        </label>

        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(event) =>
            updateField("description", event.target.value)
          }
          placeholder="Describe las características..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Precio */}
      <div className="space-y-2">
        <label
          htmlFor="price"
          className="block text-sm font-medium"
        >
          Precio (COP) *
        </label>

        <input
          id="price"
          type="number"
          required
          min={0}
          max={9999999999}
          step={1}
          value={form.price}
          onChange={(event) =>
            updateField("price", event.target.value)
          }
          placeholder="90000"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Categoría */}
      <div className="space-y-2">
        <label
          htmlFor="category"
          className="block text-sm font-medium"
        >
          Categoría *
        </label>

        <select
          id="category"
          required
          value={form.categoryId}
          onChange={(event) =>
            updateField("categoryId", event.target.value)
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
        >
          <option value="">
            Selecciona una categoría
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Disponibilidad */}
      <div className="space-y-2">
        <label
          htmlFor="available"
          className="block text-sm font-medium"
        >
          Disponibilidad
        </label>

        <select
          id="available"
          value={form.available ? "true" : "false"}
          onChange={(event) =>
            updateField(
              "available",
              event.target.value === "true"
            )
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
        >
          <option value="true">Disponible</option>
          <option value="false">Agotado</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Acciones */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/admin/products"
          className="rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {isEditing
            ? "Guardar cambios"
            : "Guardar producto"}
        </button>
      </div>
    </form>
  );
}
