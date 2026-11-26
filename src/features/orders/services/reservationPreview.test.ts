import { describe, expect, it, vi } from "vitest";
import { prepareReservationPreview } from "@/features/orders/services/reservationPreview";
import type { ParsedReservationMessage } from "@/features/orders/types/order";
import type { Product } from "@/features/products/types/product";

const reservation: ParsedReservationMessage = {
  productName: "Monopolio",
  productCode: "EDU-0001",
  quantity: 3,
  referencePrice: 25,
};

const product: Product = {
  id: "7",
  code: "EDU-0001",
  categoryId: "4",
  name: "Monopolio",
  description: null,
  price: 30,
  stock: 5,
  imageUrl: null,
  isActive: true,
};

describe("prepareReservationPreview", () => {
  it("returns product not found without inventing data", async () => {
    const lookup = vi.fn().mockResolvedValue(null);
    expect(await prepareReservationPreview(reservation, lookup)).toEqual({
      status: "product_not_found",
    });
    expect(lookup).toHaveBeenCalledWith("EDU-0001");
  });

  it("uses the current PostgreSQL price to calculate the total", async () => {
    const result = await prepareReservationPreview(
      reservation,
      vi.fn().mockResolvedValue(product),
    );

    expect(result).toEqual({
      status: "success",
      preview: expect.objectContaining({
        currentUnitPrice: 30,
        referencePrice: 25,
        quantity: 3,
        total: 90,
        referencePriceMatches: false,
      }),
    });
  });
});
