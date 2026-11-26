import { describe, expect, it } from "vitest";
import type { Product } from "@/features/products/types/product";
import {
  buildWhatsAppReservationMessage,
  buildWhatsAppReservationUrl,
} from "@/features/products/utils/whatsAppReservation";

const product: Product = {
  id: "1",
  code: "EDU-0001",
  categoryId: "1",
  name: "Monopolio",
  description: null,
  price: 25,
  stock: 3,
  imageUrl: null,
  isActive: true,
};

describe("WhatsApp reservation", () => {
  it("builds the exact multiline message with real product data", () => {
    const message = buildWhatsAppReservationMessage(product, 1);

    expect(message).toBe([
      "Hola, quiero reservar el siguiente juguete de Beetho:",
      "",
      "Producto: Monopolio",
      "Código: EDU-0001",
      "Cantidad: 1 unidad",
      "Precio referencial: Bs 25,00",
      "",
      "¿Está disponible?",
    ].join("\n"));
  });

  it("uses the plural form for quantities greater than one", () => {
    expect(buildWhatsAppReservationMessage(product, 2)).toContain("Cantidad: 2 unidades");
  });

  it("encodes the message in the WhatsApp URL", () => {
    const url = buildWhatsAppReservationUrl(product, 1, "59176454746");

    expect(url).toContain("https://wa.me/59176454746?text=");
    expect(decodeURIComponent(url?.split("?text=")[1] ?? "")).toBe(
      buildWhatsAppReservationMessage(product, 1),
    );
  });

  it("prevents reservations for unavailable products", () => {
    expect(buildWhatsAppReservationUrl({ ...product, stock: 0 }, 1, "59176454746")).toBeNull();
    expect(buildWhatsAppReservationUrl({ ...product, isActive: false }, 1, "59176454746")).toBeNull();
  });

  it("rejects invalid quantities", () => {
    expect(() => buildWhatsAppReservationMessage(product, 0)).toThrow();
  });
});
