import { describe, expect, it } from "vitest";
import type { Product } from "@/features/products/types/product";
import {
  buildWhatsAppReservationMessage,
  buildWhatsAppReservationUrl,
} from "@/features/products/utils/whatsAppReservation";

const product: Product = {
  id: "1",
  code: "BET-0001",
  categoryId: "1",
  name: "Osito de peluche",
  description: null,
  price: 80,
  stock: 3,
  imageUrl: null,
  isActive: true,
};

describe("WhatsApp reservation", () => {
  it("builds a message with real product data and quantity", () => {
    const message = buildWhatsAppReservationMessage(product, 2);

    expect(message).toContain("Producto: Osito de peluche");
    expect(message).toContain("Código: BET-0001");
    expect(message).toContain("Cantidad: 2 unidades");
    expect(message).toContain("Precio referencial: Bs 80,00");
  });

  it("encodes the message in the WhatsApp URL", () => {
    const url = buildWhatsAppReservationUrl(product, 1, "59176454746");

    expect(url).toContain("https://wa.me/59176454746?text=");
    expect(decodeURIComponent(url?.split("?text=")[1] ?? "")).toContain("Cantidad: 1 unidad");
  });

  it("prevents reservations for unavailable products", () => {
    expect(buildWhatsAppReservationUrl({ ...product, stock: 0 }, 1, "59176454746")).toBeNull();
    expect(buildWhatsAppReservationUrl({ ...product, isActive: false }, 1, "59176454746")).toBeNull();
  });

  it("rejects invalid quantities", () => {
    expect(() => buildWhatsAppReservationMessage(product, 0)).toThrow();
  });
});
