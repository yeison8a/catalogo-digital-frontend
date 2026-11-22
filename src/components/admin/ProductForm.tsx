
"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import type { Category, Product } from "@/types/product";

import { saveProduct } from "@/lib/productStorage";
import ProductImageUploader from "./ProductImageUploader";

import {
  useStoredCategories,
  mergeCategories,
} from "@/lib/categoryStorage";

import {
  createProductAction,
} from "@/app/(admin)/admin/products/new/actions";

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

  // La edición antigua todavía utiliza almacenamiento local.
  // Se conserva para no romper el componente existente.
  const storedCategories = useStoredCategories();

  const isEditing = Boolean(initialProduct);

  // Para crear productos utilizamos exclusivamente
  // las categorías reales recibidas desde Spring Boot.
  const allCategories = isEditing
    ? mergeCategories(categories, storedCategories)
    : categories;

  const activeCategories = allCategories.filter(
    (category) => category.active
  );

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
  const [isPending, startTransition] = useTransition();

  /**
   * Actualiza los valores del formulario.
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
   * Valida los datos y registra el producto.
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

    const category = activeCategories.find(
      (item) => item.id === form.categoryId
    );

    if (
      name.length < (isEditing ? 3 : 2) ||
      name.length > 150
    ) {
      setError(
        `El nombre debe tener entre ${
          isEditing ? 3 : 2
        } y 150 caracteres.`
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
      price < 0 ||
      !Number.isInteger(price) ||
      price > 9999999999
    ) {
      setError("Ingresa un precio válido en COP.");
      return;
    }

    if (!category) {
      setError("Selecciona una categoría activa válida.");
      return;
    }

    /**
     * Edición antigua.
     *
     * Mantener este comportamiento temporalmente.
     * La conexión de la edición con Spring Boot
     * se implementará en el siguiente paso.
     */
    if (initialProduct) {
      const product: Product = {
        id: initialProduct.id,
        name,
        description,
        price,
        available: form.available,
        active: initialProduct.active,
        category,
        mainImageUrl: initialProduct.mainImageUrl,
      };

      try {
        saveProduct(product);
        router.push("/admin/products");
      } catch {
        setError("No fue posible guardar los cambios.");
      }

      return;
    }

    /**
     * Creación real.
     *
     * No generamos UUID en el navegador.
     * Spring Boot crea el producto y devuelve
     * su identificador.
     */
    startTransition(async () => {
      try {
        const result = await createProductAction({
          name,
          description,
          price,
          categoryId: category.id,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        // El UUID lo genera Spring Boot.
        // Volvemos al listado administrativo real.
        router.push("/admin/products");
        router.refresh();

      } catch (error) {
        console.error(
          "Error inesperado al crear producto:",
          error
        );

        setError(
          "Ocurrió un error inesperado al registrar el producto."
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
          minLength={isEditing ? 3 : 2}
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
          disabled={isPending || activeCategories.length === 0}
          onChange={(event) =>
            updateField("categoryId", event.target.value)
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary disabled:bg-slate-100"
        >
          <option value="">
            Selecciona una categoría
          </option>

          {activeCategories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        {activeCategories.length === 0 && (
          <p className="text-sm text-amber-700">
            No hay categorías activas disponibles.
            Primero debes crear o activar una categoría.
          </p>
        )}
      </div>

      {/* Disponibilidad: edición antigua */}
      {isEditing && (
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
            disabled={isPending}
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
      )}

      {/* Fotografías: se integrarán después */}
      {isEditing ? (
        <div className="border-t border-slate-200 pt-6">
          <ProductImageUploader />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Fotografías y disponibilidad
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Primero registraremos el producto en PostgreSQL.
            Después podrás configurar su disponibilidad
            y subir sus fotografías a Cloudinary desde
            las herramientas administrativas.
          </p>
        </div>
      )}

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
            if (isPending) event.preventDefault();
          }}
          className={`rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 ${
            isPending ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isPending || activeCategories.length === 0}
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
