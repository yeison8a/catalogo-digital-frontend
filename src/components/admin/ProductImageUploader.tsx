
"use client";

import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";

import type {
  ProductImage,
  SelectedProductImage,
} from "@/types/productImage";

import {
  uploadProductImageAction,
} from "@/app/(admin)/admin/products/[id]/images/actions";

interface ProductImageUploaderProps {
  productId: string;
  initialImages: ProductImage[];
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 *1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
];

/**
 * Genera una vista previa local.
 * No realiza ninguna petición al backend.
 */
function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(
          new Error("No se pudo leer la fotografía.")
        );
      }
    };

    reader.onerror = () => {
      reject(
        new Error("No se pudo leer la fotografía.")
      );
    };

    reader.readAsDataURL(file);
  });
}

export default function ProductImageUploader({
  productId,
  initialImages,
}: ProductImageUploaderProps) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  // Fotografías seleccionadas pero aún
  // no enviadas a Spring Boot.
  const [selectedImages, setSelectedImages] =
    useState<SelectedProductImage[]>([]);

  // Fotografías subidas durante esta sesión.
  // Evitamos duplicarlas cuando router.refresh()
  // actualice initialImages desde el servidor.
  const [uploadedImages, setUploadedImages] =
    useState<ProductImage[]>([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isPreparing, setIsPreparing] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [progress, setProgress] = useState("");

  // Fotografías realmente registradas.
  const persistedImages = [
    ...initialImages,
    ...uploadedImages.filter(
      (uploaded) =>
        !initialImages.some(
          (existing) => existing.id === uploaded.id
        )
    ),
  ].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const totalImages =
    persistedImages.length +
    selectedImages.length;

  const isBusy = isPreparing || isUploading;

  const canSelect =
    !isBusy && totalImages < MAX_IMAGES;

  /**
   * Seleccionar imágenes y generar
   * vistas previas sin subirlas todavía.
   */
  async function handleFiles(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (files.length === 0 || isBusy) {
      return;
    }

    setError("");
    setMessage("");

    if (
      totalImages + files.length > MAX_IMAGES
    ) {
      setError(
        `Solo puedes tener ${MAX_IMAGES} fotografías por producto.`
      );
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(
          "Solo se permiten fotografías JPG o PNG."
        );
        return;
      }

      if (file.size === 0) {
        setError(
          "No se permiten archivos vacíos."
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `La fotografía "${file.name}" supera los 5 MiB.`
        );
        return;
      }
    }

    setIsPreparing(true);

    try {
      const previews = await Promise.all(
        files.map(async (file) => ({
          id: crypto.randomUUID(),
          file,
          previewUrl: await readImage(file),
        }))
      );

      setSelectedImages((previous) => [
        ...previous,
        ...previews,
      ]);

    } catch {
      setError(
        "No fue posible preparar las vistas previas."
      );
    } finally {
      setIsPreparing(false);
    }
  }

  /**
   * Quitar una fotografía que todavía
   * no ha sido enviada a Cloudinary.
   */
  function removeSelectedImage(id: string) {
    if (isBusy) {
      return;
    }

    setSelectedImages((previous) =>
      previous.filter(
        (image) => image.id !== id
      )
    );

    setError("");
    setMessage("");
  }

  /**
   * Subir cada fotografía por separado.
   *
   * El backend solo recibe un archivo
   * por petición multipart/form-data.
   */
  async function uploadImages() {
    if (
      isBusy ||
      selectedImages.length === 0
    ) {
      return;
    }

    setError("");
    setMessage("");
    setProgress("");
    setIsUploading(true);

    let uploadedCount = 0;

    try {
      for (
        let index = 0;
        index < selectedImages.length;
        index++
      ) {
        const selected = selectedImages[index];

        setProgress(
          `Subiendo fotografía ${
            index + 1
          } de ${selectedImages.length}...`
        );

        const formData = new FormData();

        // Nombre exigido por Spring Boot.
        formData.append(
          "file",
          selected.file
        );

        const result =
          await uploadProductImageAction(
            productId,
            formData
          );

        if (!result.success) {
          setError(result.message);
          break;
        }

        uploadedCount++;

        // Registrar inmediatamente la fotografía
        // confirmada por el backend.
        const uploaded: ProductImage = {
          id: result.imageId,
          imageUrl: result.imageUrl,
          productId,
          sortOrder:
            persistedImages.length +
            uploadedCount - 1,
          mainImage:
            persistedImages.length === 0 &&
            uploadedCount === 1,
        };

        setUploadedImages((previous) => [
          ...previous,
          uploaded,
        ]);

        // Quitar de pendientes únicamente
        // la fotografía que se subió.
        setSelectedImages((previous) =>
          previous.filter(
            (image) => image.id !== selected.id
          )
        );
      }

      if (uploadedCount > 0) {
        setMessage(
          uploadedCount === 1
            ? "Fotografía subida correctamente a Cloudinary."
            : `${uploadedCount} fotografías subidas correctamente a Cloudinary.`
        );

        // Volver a consultar los datos reales.
        router.refresh();
      }

    } catch (unexpectedError) {
      console.error(
        "Error al subir fotografías:",
        unexpectedError
      );

      setError(
        "Ocurrió un error durante la carga. Verifica las imágenes registradas antes de intentar nuevamente."
      );

      // Consultar el servidor por si la carga
      // se completó aunque no llegara la respuesta.
      router.refresh();

    } finally {
      setIsUploading(false);
      setProgress("");
    }
  }

  return (
    <section className="space-y-4">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Fotografías del producto
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Selecciona hasta {MAX_IMAGES} fotografías.
          Formatos JPG o PNG.
          Máximo 5 MiB por archivo.
        </p>
      </div>

      {/* Selector de archivos */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        disabled={!canSelect}
        onChange={handleFiles}
        className="sr-only"
        aria-label="Seleccionar fotografías"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={!canSelect}
        className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className="text-3xl"
          aria-hidden="true"
        >
          📷
        </span>

        <span className="text-sm font-semibold text-slate-700">
          {isPreparing
            ? "Procesando imágenes..."
            : isUploading
              ? "Subiendo fotografías..."
              : "Seleccionar fotografías"}
        </span>

        <span className="text-xs text-slate-500">
          {totalImages} de {MAX_IMAGES} fotografías
        </span>
      </button>

      {/* Mensajes */}
      {progress && (
        <p
          role="status"
          className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700"
        >
          {progress}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {/* Fotografías almacenadas */}
      {persistedImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Fotografías guardadas
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {persistedImages.map((image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={image.imageUrl}
                    alt="Fotografía del producto"
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />

                  {image.mainImage && (
                    <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                      Principal
                    </span>
                  )}
                </div>

                <div className="space-y-2 p-3">
                  <p className="text-xs text-green-700">
                    Guardada en Cloudinary
                  </p>

                  <button
                    type="button"
                    disabled
                    title="Disponible en un próximo paso"
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium text-slate-400"
                  >
                    {image.mainImage
                      ? "Imagen principal"
                      : "Hacer principal"}
                  </button>

                  <button
                    type="button"
                    disabled
                    title="Disponible en un próximo paso"
                    className="w-full cursor-not-allowed rounded-lg bg-red-50 px-2 py-2 text-xs font-medium text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Fotografías pendientes */}
      {selectedImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Fotografías pendientes de subir
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedImages.map((image) => (
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
                </div>

                <div className="space-y-2 p-3">
                  <p
                    className="truncate text-xs text-slate-600"
                    title={image.file.name}
                  >
                    {image.file.name}
                  </p>

                  <p className="text-xs text-amber-700">
                    Pendiente de guardar
                  </p>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      removeSelectedImage(image.id)
                    }
                    className="w-full rounded-lg bg-red-50 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Quitar
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            disabled={isBusy}
            onClick={uploadImages}
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading
              ? "Subiendo fotografías..."
              : `Subir ${
                  selectedImages.length
                } ${
                  selectedImages.length === 1
                    ? "fotografía"
                    : "fotografías"
                }`}
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500">
        La primera fotografía subida será la imagen
        principal. La selección de otra imagen
        principal y la eliminación de fotografías
        guardadas se habilitarán posteriormente.
      </p>
    </section>
  );
}
