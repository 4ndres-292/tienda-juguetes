import { formatProductPrice } from "@/features/products/utils/productPresentation";

type RegisteredReservationSummary = {
  publicCode: string;
  itemCount: number;
  total: number;
};

export function buildRegisteredReservationMessage(
  reservation: RegisteredReservationSummary,
): string {
  const productLabel = reservation.itemCount === 1 ? "1 juguete" : `${reservation.itemCount} juguetes`;

  return [
    "Hola, realicé una solicitud de reserva en Beetho.",
    "",
    `Código: ${reservation.publicCode}`,
    `Productos: ${productLabel}`,
    `Total referencial: ${formatProductPrice(reservation.total)}`,
    "",
    "¿Podrían confirmar mi reserva?",
  ].join("\n");
}

export function buildRegisteredReservationWhatsAppUrl(
  reservation: RegisteredReservationSummary,
  whatsAppNumber: string,
): string {
  const message = buildRegisteredReservationMessage(reservation);

  return `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
}
