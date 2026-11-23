
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
  reorderProductImagesAction,
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

  const inputRef = useRef<HTMLInputElement>(null);

  // Fotografías pendientes de subir.
  const [selectedImages, setSelectedImages] =
    useState<SelectedProductImage[]>([]);

  // Fotografías subidas durante esta sesión.
  const [uploadedImages, setUploadedImages] =
    useState<ProductImage[]>([]);

  // Orden confirmado por una operación de edición.
  const [orderedIds, setOrderedIds] =
    useState<string[] | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState("");

  const [isPreparing, setIsPreparing] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [
    changingMainImageId,
    setChangingMainImageId,
  ] = useState<string | null>(null);

  const [
    reorderingImageId,
    setReorderingImageId,
  ] = useState<string | null>(null);

  /**
   * Combinar fotografías recibidas de Spring Boot
   * con las que acabamos de subir.
   */
  const mergedImages = [
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

  /**
   * Mostrar el último orden confirmado.
   *
   * Si todavía no hemos reordenado,
   * utilizamos el orden de PostgreSQL.
   */
  const persistedImages = orderedIds
    ? [...mergedImages].sort((a, b) => {
        const aPosition = orderedIds.indexOf(a.id);
        const bPosition = orderedIds.indexOf(b.id);

        if (aPosition === -1 && bPosition === -1) {
          return a.sortOrder - b.sortOrder;
        }

        if (aPosition === -1) return 1;
        if (bPosition === -1) return -1;

        return aPosition - bPosition;
      })
    : mergedImages;

  const totalImages =
    persistedImages.length +
    selectedImages.length;

  const isBusy =
    isPreparing ||
    isUploading ||
    changingMainImageId !== null ||
    reorderingImageId !== null;

  const canSelect =
    !isBusy &&
    totalImages < MAX_IMAGES;

  /**
   * Seleccionar fotografías y crear vistas previas.
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
   * Quitar una fotografía que todavía
   * no se ha subido a Cloudinary.
   */
  function removeSelectedImage(imageId: string) {
    if (isBusy) return;

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
    const pending = [...selectedImages];

    try {
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

        // Si ya existe un orden elegido,
        // agregar la nueva imagen al final.
        setOrderedIds((previous) =>
          previous
            ? [...previous, uploaded.id]
            : null
        );

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
   * Seleccionar la imagen principal real.
   */
  async function handleSetMainImage(
    imageId: string
  ) {
    if (isBusy) return;

    const selectedImage = persistedImages.find(
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
        "Error seleccionando imagen principal:",
        unexpectedError
      );

      setError(
        "No fue posible confirmar el cambio de imagen principal."
      );

      router.refresh();
    } finally {
      setChangingMainImageId(null);
    }
  }

  /**
   * Mover una fotografía una posición
   * hacia la izquierda o la derecha.
   *
   * direction:
   * -1 = posición anterior
   *  1 = posición siguiente
   */
  async function handleMoveImage(
    imageId: string,
    direction: -1 | 1
  ) {
    if (isBusy) return;

    const currentIndex =
      persistedImages.findIndex(
        (image) => image.id === imageId
      );

    if (currentIndex === -1) return;

    const targetIndex =
      currentIndex + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= persistedImages.length
    ) {
      return;
    }

    // Obtener todos los UUID actuales.
    const nextIds = persistedImages.map(
      (image) => image.id
    );

    // Intercambiar las dos posiciones.
    [
      nextIds[currentIndex],
      nextIds[targetIndex],
    ] = [
      nextIds[targetIndex],
      nextIds[currentIndex],
    ];

    setError("");
    setMessage("");
    setReorderingImageId(imageId);

    try {
      const result =
        await reorderProductImagesAction(
          productId,
          nextIds
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      // Solo cambiamos la secuencia local
      // después de la confirmación del backend.
      setOrderedIds(nextIds);

      setMessage(
        "El orden de las fotografías se guardó correctamente."
      );

      // Consultar nuevamente PostgreSQL.
      router.refresh();
    } catch (unexpectedError) {
      console.error(
        "Error al ordenar fotografías:",
        unexpectedError
      );

      setError(
        "No se pudo confirmar el orden. Recarga la página antes de intentarlo otra vez."
      );

      router.refresh();
    } finally {
      setReorderingImageId(null);
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

      {/* Selector */}
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

      {/* Fotografías guardadas */}
      {persistedImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Fotografías guardadas
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {persistedImages.map((image, index) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                {/* Fotografía */}
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={image.imageUrl}
                    alt={`Fotografía ${index + 1} del producto`}
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

                  <p className="text-xs font-medium text-slate-600">
                    Posición {index + 1} de{" "}
                    {persistedImages.length}
                  </p>

                  {/* Ordenar fotografías */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleMoveImage(image.id, -1)
                      }
                      disabled={isBusy || index === 0}
                      aria-label={`Mover fotografía ${index + 1} a la posición anterior`}
                      className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      ← Anterior
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleMoveImage(image.id, 1)
                      }
                      disabled={
                        isBusy ||
                        index === persistedImages.length - 1
                      }
                      aria-label={`Mover fotografía ${index + 1} a la posición siguiente`}
                      className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Siguiente →
                    </button>
                  </div>

                  {reorderingImageId === image.id && (
                    <p
                      role="status"
                      className="text-xs text-blue-700"
                    >
                      Guardando orden...
                    </p>
                  )}

                  {/* Imagen principal */}
                  <button
                    type="button"
                    onClick={() =>
                      handleSetMainImage(image.id)
                    }
                    disabled={isBusy || image.mainImage}
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
              : `Subir ${selectedImages.length} ${
                  selectedImages.length === 1
                    ? "fotografía"
                    : "fotografías"
                }`}
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Utiliza Anterior y Siguiente para cambiar
        el orden de las fotografías guardadas.
        La imagen principal se administra por separado.
        La eliminación de fotografías almacenadas
        se habilitará posteriormente.
      </p>
    </section>
  );
}
