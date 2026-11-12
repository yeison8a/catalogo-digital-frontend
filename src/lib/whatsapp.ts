
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/formatCurrency";

export function createWhatsAppLink(
  product: Product,
  phoneNumber: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  if (!/^\d{8,15}$/.test(cleanNumber)) {
    throw new Error("Número de WhatsApp inválido");
  }

  const message = [
    "Hola, estoy interesado en este producto:",
    "",
    `*${product.name}*`,
    `Precio: ${formatCurrency(product.price)}`,
    `Referencia: ${product.id}`,
    "",
    "¿Podrías darme más información?",
  ].join("\n");

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
