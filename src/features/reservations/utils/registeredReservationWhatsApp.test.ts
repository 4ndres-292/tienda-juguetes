import { describe, expect, it } from "vitest";
import {
  buildRegisteredReservationMessage,
  buildRegisteredReservationWhatsAppUrl,
} from "./registeredReservationWhatsApp";

describe("registered reservation WhatsApp", () => {
  const reservation = { publicCode: "RES-0001", itemCount: 3, total: 130 };

  it("builds the message from the registered reservation", () => {
    expect(buildRegisteredReservationMessage(reservation)).toBe(
      "Hola, realicé una solicitud de reserva en Beetho.\n\n" +
      "Código: RES-0001\n" +
      "Productos: 3 juguetes\n" +
      "Total referencial: Bs 130,00\n\n" +
      "¿Podrían confirmar mi reserva?",
    );
  });

  it("encodes the message for the configured destination", () => {
    const url = buildRegisteredReservationWhatsAppUrl(reservation, "59176454746");

    expect(url).toContain("https://wa.me/59176454746?text=");
    expect(decodeURIComponent(url.split("?text=")[1] ?? "")).toContain("Código: RES-0001");
  });
});
