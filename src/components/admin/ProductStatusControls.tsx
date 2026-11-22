
"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import type { Product } from "@/types/product";

import {
  updateProductPublicationAction,
  updateProductAvailabilityAction,
} from "@/app/(admin)/admin/products/actions";

interface ProductStatusControlsProps {
  product: Product;
}

export default function ProductStatusControls({
  product,
}: ProductStatusControlsProps) {
  const router = useRouter();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmHide, setConfirmHide] = useState(false);

  const [isPending, startTransition] =
    useTransition();

  /**
   * Actualiza un estado en Spring Boot.
   */
  function updateStatus(
    field: "available" | "active",
    value: boolean
  ) {
    if (isPending) return;

    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const result =
          field === "available"
            ? await updateProductAvailabilityAction(
                product.id,
                value
              )
            : await updateProductPublicationAction(
                product.id,
                value
              );

        if (!result.success) {
          setError(result.message);
          return;
        }

        // Cerrar la confirmación después
        // de recibir una respuesta exitosa.
        setConfirmHide(false);

        if (field === "available") {
          setMessage(
            value
              ? "Producto marcado como disponible."
              : "Producto marcado como agotado."
          );
        } else {
          setMessage(
            value
              ? "Producto publicado correctamente."
              : "Producto ocultado correctamente."
          );
        }

        // Consultar nuevamente los estados
        // registrados en PostgreSQL.
        router.refresh();

      } catch (error) {
        console.error(
          "Error inesperado al cambiar estado:",
          error
        );

        setError(
          "Ocurrió un error inesperado. Comprueba el estado antes de reintentar."
        );
      }
    });
  }

  return (
    <div
      className="space-y-3"
      aria-busy={isPending}
    >
      {/* Disponibilidad */}
      <label className="flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-700">
          Disponible
        </span>

        <input
          type="checkbox"
          checked={product.available}
          disabled={isPending}
          onChange={(event) =>
            updateStatus(
              "available",
              event.target.checked
            )
          }
          className="h-5 w-5 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>

      {/* Publicación */}
      <label className="flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-700">
          Publicado
        </span>

        <input
          type="checkbox"
          checked={product.active}
          disabled={isPending || confirmHide}
          onChange={(event) => {
            if (!event.target.checked) {
              // No ocultar inmediatamente.
              setError("");
              setMessage("");
              setConfirmHide(true);
            } else {
              updateStatus("active", true);
            }
          }}
          className="h-5 w-5 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>

      {/* Confirmación para ocultar */}
      {confirmHide && (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">

          <p className="text-sm text-amber-900">
            ¿Deseas ocultar este producto?
          </p>

          <p className="text-xs text-amber-800">
            El producto permanecerá registrado,
            pero quedará marcado como no publicado.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setConfirmHide(false);
                setError("");
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                updateStatus("active", false)
              }
              className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {isPending
                ? "Guardando..."
                : "Confirmar"}
            </button>
          </div>
        </div>
      )}

      {/* Error real del backend */}
      {error && (
        <p
          role="alert"
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}

      {/* Mensaje de éxito */}
      {message && (
        <p
          role="status"
          className="text-xs text-green-700"
        >
          {message}
        </p>
      )}
    </div>
  );
}
