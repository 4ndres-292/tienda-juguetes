import { describe, expect, it } from "vitest";
import type { ReservationItem } from "@/features/reservations/types/reservation";
import {
  addReservationProduct,
  calculateReservationItemCount,
  calculateReservationTotal,
  removeReservationProduct,
  updateReservationQuantity,
} from "./reservationList";

const product: Omit<ReservationItem, "quantity"> = {
  productId: "1",
  code: "PEL-0001",
  name: "Osito",
  price: 25.5,
  stock: 2,
  imageUrl: null,
  isActive: true,
};

describe("reservation list", () => {
  it("adds products and increases an existing quantity", () => {
    const firstList = addReservationProduct([], product);
    const secondList = addReservationProduct(firstList, product);

    expect(secondList).toEqual([{ ...product, quantity: 2 }]);
  });

  it("rejects inactive and unavailable products", () => {
    expect(addReservationProduct([], { ...product, isActive: false })).toEqual([]);
    expect(addReservationProduct([], { ...product, stock: 0 })).toEqual([]);
  });

  it("rejects invalid quantities and removes products", () => {
    const items = [{ ...product, quantity: 1 }];

    expect(updateReservationQuantity(items, product.productId, 0)).toEqual(items);
    expect(removeReservationProduct(items, product.productId)).toEqual([]);
  });

  it("calculates item count and monetary total", () => {
    const items = [{ ...product, quantity: 3 }];

    expect(calculateReservationItemCount(items)).toBe(3);
    expect(calculateReservationTotal(items)).toBe(76.5);
  });
});
