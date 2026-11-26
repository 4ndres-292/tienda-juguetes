import { describe, expect, it } from "vitest";
import { reservationRequestSchema } from "./reservationRequestSchema";

const validRequest = {
  customerName: "Andrea",
  customerPhone: "+591 764-54746",
  idempotencyKey: "09f29b42-1510-4ddd-b4fe-b178585ec563",
  items: [
    { productId: "1", quantity: 2 },
    { productId: "2", quantity: 1 },
  ],
};

describe("reservationRequestSchema", () => {
  it("normalizes the customer phone and accepts multiple unique products", () => {
    const result = reservationRequestSchema.parse(validRequest);

    expect(result.customerPhone).toBe("+59176454746");
    expect(result.items).toHaveLength(2);
  });

  it.each([0, -1, 1.5, 100])("rejects invalid quantity %s", (quantity) => {
    const result = reservationRequestSchema.safeParse({
      ...validRequest,
      items: [{ productId: "1", quantity }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects duplicated products", () => {
    const result = reservationRequestSchema.safeParse({
      ...validRequest,
      items: [
        { productId: "1", quantity: 1 },
        { productId: "1", quantity: 2 },
      ],
    });

    expect(result.success).toBe(false);
  });
});
