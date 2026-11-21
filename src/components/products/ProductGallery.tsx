
"use client";

import { useState } from "react";
import Image from "next/image";

import type { ProductImage } from "@/types/productImage";

interface ProductGalleryProps {
  productName: string;
  images: ProductImage[];
  mainImageUrl: string | null;
}

export default function ProductGallery({
  productName,
  images,
  mainImageUrl,
}: ProductGalleryProps) {
  // Ordenar las imágenes según PostgreSQL.
  const sortedImages = [...images].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  // Evitar mostrar imágenes repetidas.
  const uniqueImages = sortedImages.filter(
    (image, index, array) =>
      array.findIndex(
        (item) => item.imageUrl === image.imageUrl
      ) === index
  );

  // Si el endpoint de imágenes no devuelve
  // fotografías, utilizar la imagen principal.
  const galleryImages: ProductImage[] =
    uniqueImages.length > 0
      ? uniqueImages
      : mainImageUrl
        ? [
            {
              id: "main-image",
              productId: "",
              imageUrl: mainImageUrl,
              sortOrder: 0,
              mainImage: true,
            },
          ]
        : [];

  // Seleccionar inicialmente la fotografía principal.
  const initialImage =
    galleryImages.find((image) => image.mainImage) ??
    galleryImages.find(
      (image) => image.imageUrl === mainImageUrl
    ) ??
    galleryImages[0];

  const [selectedImageId, setSelectedImageId] = useState(
    initialImage?.id ?? null
  );

  const selectedImage =
    galleryImages.find(
      (image) => image.id === selectedImageId
    ) ?? initialImage;

  // Producto sin fotografías.
  if (!selectedImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-100">
        <div className="text-center">
          <span className="text-7xl" role="img" aria-label="Sin fotografía">
            📦
          </span>

          <p className="mt-3 text-sm text-slate-500">
            Imagen no disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Fotografía seleccionada */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={selectedImage.imageUrl}
          alt={`Fotografía de ${productName}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
        />
      </div>

      {/* Miniaturas */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">

          {galleryImages.map((image, index) => {
            const isSelected =
              image.id === selectedImage.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageId(image.id)}
                aria-label={`Mostrar fotografía ${index + 1} de ${productName}`}
                aria-pressed={isSelected}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-slate-100 transition ${
                  isSelected
                    ? "border-primary"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <Image
                  src={image.imageUrl}
                  alt={`${productName}, miniatura ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 25vw, 120px"
                  className="object-cover"
                />
              </button>
            );
          })}

        </div>
      )}
    </div>
  );
}
