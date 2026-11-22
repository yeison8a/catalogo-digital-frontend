
"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";

import type {
  ProductImage,
  SelectedProductImage,
} from "@/types/productImage";

import {
  uploadProductImageAction,
  setMainProductImageAction,
} from "@/app/(admin)/admin/products/[id]/images/actions";

interface ProductImageUploaderProps {
  productId: string;
  initialImages: ProductImage[];
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
];

/**
 * Genera una vista previa local.
 * No envía ningún archivo al servidor.
 */
function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(
          new Error(
            "No se pudo leer la fotografía."
          )
        );
      }
    };

    reader.onerror = () => {
      reject(
        new Error(
          "No se pudo leer la fotografía."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Componente para administrar las fotografías
 * reales de un producto.
 */
export default function ProductImageUploader({
  productId,
  initialImages,
}: ProductImageUploaderProps) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  /**
   * Fotografías seleccionadas
   * pero todavía no subidas.
   */
  const [
    selectedImages,
    setSelectedImages,
  ] = useState<SelectedProductImage[]>([]);

  /**
   * Fotografías subidas durante esta sesión.
   * Se combinan con las recibidas del servidor
   * sin duplicarlas.
   */
  const [
    uploadedImages,
    setUploadedImages,
  ] = useState<ProductImage[]>([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState("");

  const [
    isPreparing,
    setIsPreparing,
  ] = useState(false);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    changingMainImageId,
    setChangingMainImageId,
  ] = useState<string | null>(null);

  /**
   * Fotografías confirmadas por PostgreSQL
   * y las recién subidas.
   *
   * Si una imagen ya llegó desde el servidor,
   * no usamos su copia temporal.
   */
  const persistedImages = [
    ...initialImages,
    ...uploadedImages.filter(
      (uploaded) =>
        !initialImages.some(
          (existing) =>
            existing.id === uploaded.id
        )
    ),
  ].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const totalImages =
    persistedImages.length +
    selectedImages.length;

  const isBusy =
    isPreparing ||
    isUploading ||
    changingMainImageId !== null;

  const canSelect =
    !isBusy &&
    totalImages < MAX_IMAGES;

  /**
   * Seleccionar archivos y preparar
   * las vistas previas.
   */
  async function handleFiles(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (
      files.length === 0 ||
      isBusy
    ) {
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
      if (
        !ALLOWED_TYPES.includes(file.type)
      ) {
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

      if (
        file.size > MAX_FILE_SIZE
      ) {
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
    } catch (unexpectedError) {
      console.error(
        "Error preparando fotografías:",
        unexpectedError
      );

      setError(
        "No fue posible preparar las vistas previas."
      );
    } finally {
      setIsPreparing(false);
    }
  }

  /**
   * Quitar una fotografía pendiente.
   *
   * No elimina archivos de Cloudinary,
   * porque esta imagen aún no se ha subido.
   */
  function removeSelectedImage(
    imageId: string
  ) {
    if (isBusy) {
      return;
    }

    setSelectedImages((previous) =>
      previous.filter(
        (image) => image.id !== imageId
      )
    );

    setError("");
    setMessage("");
  }

  /**
   * Subir fotografías reales.
   *
   * El endpoint recibe un archivo
   * por solicitud.
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
      const pending = [...selectedImages];

      for (
        let index = 0;
        index < pending.length;
        index++
      ) {
        const selected = pending[index];

        setProgress(
          `Subiendo fotografía ${
            index + 1
          } de ${pending.length}...`
        );

        const formData = new FormData();

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

        /**
         * Registrar la nueva fotografía
         * mientras llegan los datos
         * actualizados del servidor.
         */
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

        /**
         * Quitar de pendientes solo la
         * fotografía subida correctamente.
         */
        setSelectedImages((previous) =>
          previous.filter(
            (image) =>
              image.id !== selected.id
          )
        );
      }

      if (uploadedCount > 0) {
        setMessage(
          uploadedCount === 1
            ? "Fotografía subida correctamente a Cloudinary."
            : `${uploadedCount} fotografías subidas correctamente a Cloudinary.`
        );
      }

      /**
       * Recuperar los registros reales
       * después de la operación.
       */
      router.refresh();

    } catch (unexpectedError) {
      console.error(
        "Error al subir fotografías:",
        unexpectedError
      );

      setError(
        "Ocurrió un error durante la carga. Verifica las fotografías guardadas antes de reintentar."
      );

      router.refresh();

    } finally {
      setIsUploading(false);
      setProgress("");
    }
  }

  /**
   * CAMBIAR LA IMAGEN PRINCIPAL.
   *
   * Esta función está al mismo nivel
   * que uploadImages(), no dentro de ella.
   */
  async function handleSetMainImage(
    imageId: string
  ) {
    if (isBusy) {
      return;
    }

    const selectedImage =
      persistedImages.find(
        (image) => image.id === imageId
      );

    if (
      !selectedImage ||
      selectedImage.mainImage
    ) {
      return;
    }

    setError("");
    setMessage("");
    setChangingMainImageId(imageId);

    try {
      const result =
        await setMainProductImageAction(
          productId,
          imageId
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      /**
       * Actualizar cualquier fotografía
       * recién subida que todavía esté
       * en el estado local.
       *
       * Los registros originales se
       * actualizarán con router.refresh().
       */
      setUploadedImages((previous) =>
        previous.map((image) => ({
          ...image,
          mainImage: image.id === imageId,
        }))
      );

      setMessage(
        "La imagen principal se actualizó correctamente."
      );

      router.refresh();

    } catch (unexpectedError) {
      console.error(
        "Error al seleccionar imagen principal:",
        unexpectedError
      );

      setError(
        "No se pudo confirmar el cambio. Comprueba cuál fotografía es principal antes de reintentar."
      );

      router.refresh();

    } finally {
      setChangingMainImageId(null);
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

      {/* Selector de fotografías */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleFiles}
        disabled={!canSelect}
        className="sr-only"
        aria-label="Seleccionar fotografías"
      />

      <button
        type="button"
        onClick={() =>
          inputRef.current?.click()
        }
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

      {/* Progreso de subida */}
      {progress && (
        <p
          role="status"
          className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700"
        >
          {progress}
        </p>
      )}

      {/* Mensajes de error */}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Mensajes de éxito */}
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

                {/* Imagen */}
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={image.imageUrl}
                    alt="Fotografía del producto"
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />

                  {/* Indicador de principal */}
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

                  {/* Cambiar imagen principal */}
                  <button
                    type="button"
                    onClick={() =>
                      handleSetMainImage(
                        image.id
                      )
                    }
                    disabled={
                      isBusy ||
                      image.mainImage
                    }
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {changingMainImageId === image.id
                      ? "Actualizando..."
                      : image.mainImage
                        ? "Imagen principal"
                        : "Hacer principal"}
                  </button>

                  {/* Eliminación pendiente */}
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

                {/* Vista previa */}
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

                  {/* Quitar imagen pendiente */}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      removeSelectedImage(
                        image.id
                      )
                    }
                    className="w-full rounded-lg bg-red-50 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Quitar
                  </button>

                </div>
              </article>
            ))}
          </div>

          {/* Subir imágenes */}
          <button
            type="button"
            onClick={uploadImages}
            disabled={isBusy}
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

      {/* Información */}
      <p className="text-xs text-slate-500">
        La primera fotografía subida se establece
        automáticamente como principal.
        Puedes cambiarla utilizando el botón
        &quot;Hacer principal&quot;.
        La eliminación y el ordenamiento de
        fotografías se habilitarán posteriormente.
      </p>

    </section>
  );
}
