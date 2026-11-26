import { describe, expect, it } from "vitest";
import { adminOrderRowSchema, orderStatusSchema, rejectionReasonSchema } from "./adminOrderSchema";

describe("admin order schemas", () => {
  it.each(["pending", "confirmed", "rejected", "expired"])("accepts status %s", (status) => {
    expect(orderStatusSchema.parse(status)).toBe(status);
  });

  it("preserves historical prices and current product availability", () => {
    const result = adminOrderRowSchema.parse({
      id: 4,
      public_code: "RES-0004",
      customer_name: "Andrea",
      customer_phone: "+59176454746",
      total: "50.00",
      status: "pending",
      created_at: "2026-11-26T12:00:00Z",
      expires_at: "2026-11-27T12:00:00Z",
      order_items: [{
        id: 7,
        product_id: 2,
        product_code: "PEL-0002",
        quantity: 2,
        unit_price: "25.00",
        subtotal: "50.00",
        products: { name: "Osito", stock: 1, is_active: true },
      }],
    });

    expect(result.total).toBe(50);
    expect(result.order_items[0]?.unit_price).toBe(25);
    expect(result.order_items[0]?.products?.stock).toBe(1);
  });

  it("rejects unsupported statuses and overly long rejection reasons", () => {
    expect(orderStatusSchema.safeParse("cancelled").success).toBe(false);
    expect(rejectionReasonSchema.safeParse("x".repeat(501)).success).toBe(false);
  });
});
