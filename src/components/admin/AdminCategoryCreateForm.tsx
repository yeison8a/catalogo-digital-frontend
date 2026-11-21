
"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createCategoryAction } from
  "@/app/(admin)/admin/categories/actions";

export default function AdminCategoryCreateForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setError("");
    setMessage("");

    const cleanName = name.trim();

    if (
      cleanName.length < 2 ||
      cleanName.length > 100
    ) {
      setError(
        "El nombre debe tener entre 2 y 100 caracteres."
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await createCategoryAction(
          cleanName
        );

        if (!result.success) {
          setError(result.message);
          return;
        }

        setName("");
        setMessage(
          "Categoría creada correctamente en PostgreSQL."
        );

        // Actualizar el listado de categorías reales.
        router.refresh();
      } catch (error) {
        console.error(
          "Error inesperado al crear categoría:",
          error
        );

        setError(
          "Ocurrió un error inesperado. Inténtalo nuevamente."
        );
      }
    });
  }

  return (
    <div className="space-y-4">

      <form
        onSubmit={handleSubmit}
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
            disabled={isPending}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
              setMessage("");
            }}
            placeholder="Ej. Belleza"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary disabled:bg-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Guardando categoría..."
            : "+ Agregar categoría"}
        </button>
      </form>

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

    </div>
  );
}
