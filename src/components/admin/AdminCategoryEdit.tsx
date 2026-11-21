
"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { Category } from "@/types/product";

import {
  updateCategoryAction,
} from "@/app/(admin)/admin/categories/actions";

interface AdminCategoryEditProps {
  category: Category;
}

export default function AdminCategoryEdit({
  category,
}: AdminCategoryEditProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  function startEditing() {
    setName(category.name);
    setError("");
    setMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setName(category.name);
    setError("");
    setIsEditing(false);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isPending) return;

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

    if (cleanName === category.name) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateCategoryAction(
          category.id,
          cleanName
        );

        if (!result.success) {
          setError(result.message);
          return;
        }

        setIsEditing(false);
        setMessage("Categoría actualizada correctamente.");

        // Volver a consultar las categorías reales.
        router.refresh();
      } catch (error) {
        console.error(
          "Error inesperado al editar categoría:",
          error
        );

        setError(
          "Ocurrió un error inesperado al actualizar."
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 border-t border-slate-100 pt-3"
        >
          <label
            htmlFor={`edit-${category.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Nuevo nombre
          </label>

          <input
            id={`edit-${category.id}`}
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={name}
            disabled={isPending}
            onChange={(event) =>
              setName(event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary disabled:bg-slate-100"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={cancelEditing}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={startEditing}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Editar
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-xl bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}
    </div>
  );
}
