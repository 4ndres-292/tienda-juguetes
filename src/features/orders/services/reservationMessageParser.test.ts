import { describe, expect, it } from "vitest";
import { parseReservationMessage } from "@/features/orders/services/reservationMessageParser";

const validMessage = [
  "Hola, quiero reservar el siguiente juguete de Beetho:",
  "",
  "Producto: Monopolio",
  "Código: EDU-0001",
  "Cantidad: 1 unidad",
  "Precio referencial: Bs 25,00",
  "",
  "¿Está disponible?",
].join("\n");

describe("parseReservationMessage", () => {
  it("extracts every reservation field", () => {
    expect(parseReservationMessage(validMessage)).toEqual({
      status: "success",
      reservation: {
        productName: "Monopolio",
        productCode: "EDU-0001",
        quantity: 1,
        referencePrice: 25,
      },
    });
  });

  it("tolerates extra spaces, Windows line endings and plural units", () => {
    const message = " Producto :  Juego de mesa  \r\n Código: edu-0001\r\n Cantidad :  3 unidades \r\n Precio referencial : Bs. 1.250,50 ";

    expect(parseReservationMessage(message)).toEqual({
      status: "success",
      reservation: {
        productName: "Juego de mesa",
        productCode: "EDU-0001",
        quantity: 3,
        referencePrice: 1250.5,
      },
    });
  });

  it("reports incomplete fields", () => {
    expect(parseReservationMessage("Producto: Monopolio\nCódigo: EDU-0001")).toEqual({
      status: "incomplete",
      missingFields: ["quantity", "referencePrice"],
    });
  });

  it("rejects invalid quantities", () => {
    const message = validMessage.replace("Cantidad: 1 unidad", "Cantidad: 0 unidades");
    expect(parseReservationMessage(message)).toEqual({
      status: "incomplete",
      missingFields: ["quantity"],
    });
  });
});
