
"use client";

import { useState } from "react";

import type { Product } from "@/types/product";
import { saveProduct } from "@/lib/productStorage";

interface ProductStatusControlsProps {
  product: Product;
}

export default function ProductStatusControls({
  product,
}: ProductStatusControlsProps) {
  const [error, setError] = useState("");
  const [confirmHide, setConfirmHide] = useState(false);

  function updateStatus(
    field: "available" | "active",
    value: boolean
  ) {
    try {
      saveProduct({
        ...product,
        [field]: value,
      });

      setError("");
      setConfirmHide(false);
    } catch {
      setError("No fue posible guardar el cambio.");
    }
  }

  return (
    <div className="space-y-3">
      {/* Disponibilidad */}
      <label className="flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-700">
          Disponible
        </span>

        <input
          type="checkbox"
          checked={product.available}
          onChange={(event) =>
            updateStatus("available", event.target.checked)
          }
          className="h-5 w-5 accent-blue-600"
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
          onChange={(event) => {
            if (!event.target.checked) {
              setConfirmHide(true);
            } else {
              updateStatus("active", true);
            }
          }}
          className="h-5 w-5 accent-blue-600"
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
              onClick={() => setConfirmHide(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() =>
                updateStatus("active", false)
              }
              className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-medium text-white"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
