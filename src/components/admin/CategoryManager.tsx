
"use client";

import { useState } from "react";

import type { Category, Product } from "@/types/product";
import { normalizeText } from "@/lib/normalizeText";

import {
  useStoredCategories,
  saveCategory,
  mergeCategories,
} from "@/lib/categoryStorage";

import {
  useStoredProducts,
  mergeProducts,
} from "@/lib/productStorage";

interface CategoryManagerProps {
  initialCategories: Category[];
  initialProducts: Product[];
}

export default function CategoryManager({
  initialCategories,
  initialProducts,
}: CategoryManagerProps) {
  const storedCategories = useStoredCategories();
  const storedProducts = useStoredProducts();

  const categories = mergeCategories(
    initialCategories,
    storedCategories
  );

  const products = mergeProducts(
    initialProducts,
    storedProducts
  );

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function nameExists(
    value: string,
    excludeId?: string
  ): boolean {
    const normalized = normalizeText(value);

    return categories.some(
      (category) =>
        category.id !== excludeId &&
        normalizeText(category.name) === normalized
    );
  }

  function showError(value: string) {
    setError(value);
    setMessage("");
  }

  function clearMessages() {
    setError("");
    setMessage("");
  }

  function createCategory(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    clearMessages();

    const cleanName = name.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      showError("El nombre debe tener entre 2 y 100 caracteres.");
      return;
    }

    if (nameExists(cleanName)) {
      showError("Ya existe una categoría con ese nombre.");
      return;
    }

    try {
      saveCategory({
        id: crypto.randomUUID(),
        name: cleanName,
        active: true,
      });

      setName("");
      setMessage("Categoría creada correctamente.");
    } catch {
      showError("No fue posible guardar la categoría.");
    }
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    clearMessages();
  }

  function updateCategory(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    clearMessages();

    const category = categories.find(
      (item) => item.id === editingId
    );

    if (!category) {
      showError("La categoría no existe.");
      return;
    }

    const cleanName = editName.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      showError("El nombre debe tener entre 2 y 100 caracteres.");
      return;
    }

    if (nameExists(cleanName, category.id)) {
      showError("Ya existe una categoría con ese nombre.");
      return;
    }

    try {
      saveCategory({
        ...category,
        name: cleanName,
      });

      setEditingId(null);
      setMessage("Categoría actualizada correctamente.");
    } catch {
      showError("No fue posible actualizar la categoría.");
    }
  }

  function toggleCategory(category: Category) {
    clearMessages();

    const nextActive = !category.active;

    const hasPublishedProducts = products.some(
      (product) =>
        product.category.id === category.id &&
        product.active
    );

    if (!nextActive && hasPublishedProducts) {
      showError(
        `No puedes desactivar "${category.name}" porque tiene productos publicados. Ocúltalos o asígnalos a otra categoría primero.`
      );
      return;
    }

    try {
      saveCategory({
        ...category,
        active: nextActive,
      });

      setMessage(
        nextActive
          ? "Categoría activada correctamente."
          : "Categoría desactivada correctamente."
      );
    } catch {
      showError("No fue posible modificar la categoría.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Registrar categoría */}
      <form
        onSubmit={createCategory}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Nueva categoría
        </h2>

        <div className="space-y-2">
          <label
            htmlFor="category-name"
            className="block text-sm font-medium text-slate-700"
          >
            Nombre de la categoría
          </label>

          <input
            id="category-name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Belleza"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Agregar categoría
        </button>
      </form>

      {/* Mensajes */}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-xl bg-green-50 p-4 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {/* Listado */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Categorías registradas ({categories.length})
        </h2>

        {categories.map((category) => {
          const productCount = products.filter(
            (product) =>
              product.category.id === category.id
          ).length;

          return (
            <article
              key={category.id}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {productCount}{" "}
                    {productCount === 1
                      ? "producto asociado"
                      : "productos asociados"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    category.active
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {category.active ? "Activa" : "Inactiva"}
                </span>
              </div>

              {editingId === category.id ? (
                <form
                  onSubmit={updateCategory}
                  className="space-y-3"
                >
                  <label
                    htmlFor={`edit-${category.id}`}
                    className="block text-sm font-medium"
                  >
                    Nuevo nombre
                  </label>

                  <input
                    id={`edit-${category.id}`}
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={editName}
                    onChange={(event) =>
                      setEditName(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary"
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                    >
                      Guardar
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => startEditing(category)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      category.active
                        ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                        : "bg-green-50 text-green-800 hover:bg-green-100"
                    }`}
                  >
                    {category.active
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
