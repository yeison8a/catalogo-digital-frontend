
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Category } from "@/types/product";

import {
  updateCategoryStatusAction,
} from "@/app/(admin)/admin/categories/actions";

interface AdminCategoryStatusProps {
  category: Category;
}

export default function AdminCategoryStatus({
  category,
}: AdminCategoryStatusProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleToggleStatus() {
    if (isPending) {
      return;
    }

    setError("");
    setMessage("");

    const nextActive = !category.active;

    startTransition(async () => {
      try {
        const result = await updateCategoryStatusAction(
          category.id,
          nextActive
        );

        if (!result.success) {
          setError(result.message);
          return;
        }

        setMessage(
          nextActive
            ? "Categoría activada correctamente."
            : "Categoría desactivada correctamente."
        );

        // Consultar nuevamente PostgreSQL.
        router.refresh();
      } catch (error) {
        console.error(
          "Error inesperado al cambiar estado:",
          error
        );

        setError(
          "Ocurrió un error inesperado. Inténtalo nuevamente."
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggleStatus}
        className={`rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
          category.active
            ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "bg-green-50 text-green-800 hover:bg-green-100"
        }`}
      >
        {isPending
          ? "Guardando..."
          : category.active
            ? "Desactivar"
            : "Activar"}
      </button>

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
