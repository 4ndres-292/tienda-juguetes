import { describe, expect, it } from "vitest";
import { parseStoredReservation, serializeReservation } from "./reservationStorage";

const validItem = {
  productId: "1",
  code: "PEL-0001",
  name: "Osito",
  price: 25.5,
  stock: 2,
  imageUrl: null,
  isActive: true,
  quantity: 1,
};

describe("reservation storage", () => {
  it("restores a valid reservation", () => {
    const state = { idempotencyKey: "89fe9b04-47d1-4d0a-813f-cb7712136084", items: [validItem] };

    expect(parseStoredReservation(serializeReservation(state))).toEqual(state);
  });

  it("discards malformed, inactive and unavailable entries", () => {
    const emptyState = { idempotencyKey: null, items: [] };

    expect(parseStoredReservation("not-json")).toEqual(emptyState);
    expect(parseStoredReservation(JSON.stringify([{ ...validItem, quantity: 0 }]))).toEqual(emptyState);
    expect(parseStoredReservation(JSON.stringify([{ ...validItem, isActive: false }]))).toEqual(emptyState);
    expect(parseStoredReservation(JSON.stringify([{ ...validItem, stock: 0 }]))).toEqual(emptyState);
  });

  it("migrates the previous array format without losing items", () => {
    expect(parseStoredReservation(JSON.stringify([validItem]))).toEqual({
      idempotencyKey: null,
      items: [validItem],
    });
  });
});
