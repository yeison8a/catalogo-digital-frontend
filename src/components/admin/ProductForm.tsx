
"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import type {
  Category,
  Product,
} from "@/types/product";

import {
  createProductAction,
} from "@/app/(admin)/admin/products/new/actions";

import {
  updateProductAction,
} from "@/app/(admin)/admin/products/[id]/edit/actions";

interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product;
}

interface FormValues {
  name: string;
  description: string;
  price: string;
  categoryId: string;
}

export default function ProductForm({
  categories,
  initialProduct,
}: ProductFormProps) {
  const router = useRouter();

  const isEditing = Boolean(initialProduct);

  /**
   * Las categorías provienen de PostgreSQL.
   *
   * Permitimos conservar la categoría actual
   * en edición, incluso si fue desactivada.
   * Para seleccionar una categoría diferente,
   * esta debe estar activa.
   */
  const availableCategories = categories.filter(
    (category) =>
      category.active ||
      (
        isEditing &&
        category.id === initialProduct?.category.id
      )
  );

  const [form, setForm] = useState<FormValues>({
    name: initialProduct?.name ?? "",
    description: initialProduct?.description ?? "",
    price: initialProduct
      ? String(initialProduct.price)
      : "",
    categoryId: initialProduct?.category.id ?? "",
  });

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  /**
   * Modificar los campos del formulario.
   */
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

  /**
   * Validar los datos antes de enviarlos.
   */
  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setError("");

    const name = form.name.trim();
    const description = form.description.trim();
    const price = Number(form.price);

    const category = availableCategories.find(
      (item) => item.id === form.categoryId
    );

    if (name.length < 2 || name.length > 150) {
      setError(
        "El nombre debe tener entre 2 y 150 caracteres."
      );
      return;
    }

    if (description.length > 2000) {
      setError(
        "La descripción no puede superar los 2000 caracteres."
      );
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      !Number.isInteger(price) ||
      price < 0 ||
      price > 9999999999
    ) {
      setError("Ingresa un precio válido en COP.");
      return;
    }

    if (!category) {
      setError("Selecciona una categoría válida.");
      return;
    }

    const input = {
      name,
      description,
      price,
      categoryId: category.id,
    };

    startTransition(async () => {
      try {
        /**
         * EDICIÓN REAL
         *
         * Spring Boot conserva el UUID
         * y actualiza el registro existente.
         */
        const result = initialProduct
          ? await updateProductAction(
              initialProduct.id,
              input
            )
          : await createProductAction(input);

        if (!result.success) {
          setError(result.message);
          return;
        }

        // Consultar nuevamente los datos reales
        // después de guardar.
        router.push("/admin/products");
        router.refresh();

      } catch (error) {
        console.error(
          "Error al guardar producto:",
          error
        );

        setError(
          "Ocurrió un error inesperado al guardar el producto."
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      {/* Encabezado */}
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
          minLength={2}
          maxLength={150}
          value={form.name}
          disabled={isPending}
          onChange={(event) =>
            updateField("name", event.target.value)
          }
          placeholder="Ej. Audífonos inalámbricos"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary disabled:bg-slate-100"
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
          maxLength={2000}
          value={form.description}
          disabled={isPending}
          onChange={(event) =>
            updateField("description", event.target.value)
          }
          placeholder="Describe las características..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary disabled:bg-slate-100"
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
          disabled={isPending}
          onChange={(event) =>
            updateField("price", event.target.value)
          }
          placeholder="90000"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary disabled:bg-slate-100"
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
          disabled={
            isPending ||
            availableCategories.length === 0
          }
          onChange={(event) =>
            updateField("categoryId", event.target.value)
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary disabled:bg-slate-100"
        >
          <option value="">
            Selecciona una categoría
          </option>

          {availableCategories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
              {!category.active ? " (inactiva)" : ""}
            </option>
          ))}
        </select>

        {availableCategories.length === 0 && (
          <p className="text-sm text-amber-700">
            No hay categorías disponibles.
            Primero debes crear o activar
            una categoría.
          </p>
        )}
      </div>

      {/* Funcionalidades independientes */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">
          Fotografías, publicación y disponibilidad
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Este formulario guarda el nombre,
          la descripción, el precio y la categoría
          en PostgreSQL.
          La publicación, disponibilidad y
          gestión de fotografías se configurarán
          mediante las herramientas administrativas
          correspondientes.
        </p>
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
          aria-disabled={isPending}
          onClick={(event) => {
            if (isPending) {
              event.preventDefault();
            }
          }}
          className={`rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 ${
            isPending
              ? "pointer-events-none opacity-50"
              : ""
          }`}
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={
            isPending ||
            availableCategories.length === 0
          }
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Guardando producto..."
            : isEditing
              ? "Guardar cambios"
              : "Guardar producto"}
        </button>

      </div>
    </form>
  );
}
