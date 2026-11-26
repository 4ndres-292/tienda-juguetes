import type { Product } from "@/features/products/types/product";
import { formatProductPrice } from "@/features/products/utils/productPresentation";

export function buildWhatsAppReservationMessage(product: Product, quantity = 1): string {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Reservation quantity must be a positive integer");
  }

  return [
    "Hola, quiero reservar el siguiente juguete de Beetho:",
    "",
    `Producto: ${product.name}`,
    `Código: ${product.code}`,
    `Cantidad: ${quantity} ${quantity === 1 ? "unidad" : "unidades"}`,
    `Precio referencial: ${formatProductPrice(product.price)}`,
    "",
    "¿Está disponible?",
  ].join("\n");
}

export function buildWhatsAppReservationUrl(
  product: Product,
  quantity = 1,
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
): string | null {
  if (!product.isActive || product.stock <= 0 || !phoneNumber) {
    return null;
  }

  const message = buildWhatsAppReservationMessage(product, quantity);
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
