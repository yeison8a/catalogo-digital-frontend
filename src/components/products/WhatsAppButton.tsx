
import type { Product } from "@/types/product";
import { createWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  product: Product;
}

export default function WhatsAppButton({
  product,
}: WhatsAppButtonProps) {
  const phoneNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!phoneNumber) {
    return (
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        El contacto de WhatsApp no está configurado.
      </p>
    );
  }

  let whatsappUrl: string;

  try {
    whatsappUrl = createWhatsAppLink(
      product,
      phoneNumber
    );
  } catch {
    return (
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        El número de WhatsApp configurado no es válido.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        aria-label={`Consultar por WhatsApp sobre ${product.name}`}
      >
        <span aria-hidden="true">💬</span>
        Consultar por WhatsApp
      </a>

      <p className="text-center text-xs text-slate-500">
        Se abrirá WhatsApp con un mensaje preparado.
      </p>

      <p className="text-center text-xs text-slate-500">
        Contacto: +{phoneNumber.replace(/\D/g, "")}
      </p>
    </div>
  );
}
