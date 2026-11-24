import type { Product } from "@/features/products/types/product";
import { buildWhatsAppReservationUrl } from "@/features/products/utils/whatsAppReservation";

type WhatsAppButtonProps = {
  product: Product;
  quantity?: number;
};

export function WhatsAppButton({ product, quantity = 1 }: WhatsAppButtonProps) {
  const reservationUrl = buildWhatsAppReservationUrl(product, quantity);

  if (!reservationUrl) {
    return (
      <span aria-disabled="true" className="mt-4 block cursor-not-allowed rounded-xl bg-stone-100 px-3 py-2.5 text-center text-sm font-bold text-stone-500">
        No disponible para reserva
      </span>
    );
  }

  return (
    <a
      href={reservationUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-4 block rounded-xl bg-[#25D366] px-3 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#1eaa52] focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
    >
      Reservar por WhatsApp
    </a>
  );
}
