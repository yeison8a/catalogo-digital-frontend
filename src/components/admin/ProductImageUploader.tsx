
"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";

import type { SelectedProductImage } from "@/types/productImage";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 3 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("No se pudo leer la imagen"));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ProductImageUploader() {
  const [images, setImages] = useState<SelectedProductImage[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setError("");

    if (images.length + files.length > MAX_IMAGES) {
      setError(`Solo puedes seleccionar ${MAX_IMAGES} imágenes.`);
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Solo se permiten imágenes JPG, PNG y WebP.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`La imagen "${file.name}" supera los 3 MB.`);
        return;
      }

      if (file.size === 0) {
        setError("No se permiten archivos vacíos.");
        return;
      }
    }

    setLoading(true);

    try {
      const newImages = await Promise.all(
        files.map(async (file) => ({
          id: crypto.randomUUID(),
          file,
          previewUrl: await readImage(file),
        }))
      );

      setImages((previous) => [...previous, ...newImages]);

      if (mainImageId === null && newImages.length > 0) {
        setMainImageId(newImages[0].id);
      }
    } catch {
      setError("No fue posible leer las imágenes seleccionadas.");
    } finally {
      setLoading(false);
    }
  }

  function removeImage(id: string) {
    const remaining = images.filter(
      (image) => image.id !== id
    );

    setImages(remaining);

    if (mainImageId === id) {
      setMainImageId(remaining[0]?.id ?? null);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Fotografías del producto
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Selecciona hasta {MAX_IMAGES} imágenes.
          Formatos JPG, PNG o WebP. Máximo 3 MB por archivo.
        </p>
      </div>

      {/* Campo de selección */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        disabled={loading || images.length >= MAX_IMAGES}
        className="sr-only"
        aria-label="Seleccionar fotografías"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading || images.length >= MAX_IMAGES}
        className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-3xl" aria-hidden="true">
          📷
        </span>

        <span className="text-sm font-semibold text-slate-700">
          {loading
            ? "Procesando imágenes..."
            : "Seleccionar fotografías"}
        </span>

        <span className="text-xs text-slate-500">
          {images.length} de {MAX_IMAGES} imágenes
        </span>
      </button>

      {/* Errores */}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Vista previa */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-square bg-slate-100">
                <Image
                  src={image.previewUrl}
                  alt={`Vista previa de ${image.file.name}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />

                {mainImageId === image.id && (
                  <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                    Principal
                  </span>
                )}
              </div>

              <div className="space-y-2 p-3">
                <p
                  className="truncate text-xs text-slate-600"
                  title={image.file.name}
                >
                  {image.file.name}
                </p>

                <button
                  type="button"
                  onClick={() => setMainImageId(image.id)}
                  disabled={mainImageId === image.id}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {mainImageId === image.id
                    ? "Imagen principal"
                    : "Hacer principal"}
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="w-full rounded-lg bg-red-50 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-amber-700">
        Las imágenes son vistas previas temporales.
        Todavía no se guardan ni se envían al servidor.
      </p>
    </section>
  );
}
