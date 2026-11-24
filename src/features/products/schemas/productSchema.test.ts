import { describe, expect, it } from "vitest";
import { transformProductRows } from "@/features/products/schemas/productSchema";

describe("transformProductRows", () => {
  it("validates and transforms database product rows", () => {
    const products = transformProductRows([{ id: 1, code: "BET-001", category_id: 2, name: "Osito de peluche", description: "Peluche suave", price: "80.50", stock: 4, image_url: null, is_active: true }]);

    expect(products[0]).toMatchObject({ id: "1", categoryId: "2", price: 80.5, imageUrl: null });
  });

  it("rejects invalid product data", () => {
    expect(() => transformProductRows([{ id: 1 }])).toThrow();
    expect(() =>
      transformProductRows([
        {
          id: 1,
          code: "BET-001",
          category_id: 2,
          name: "Osito",
          description: null,
          price: null,
          stock: 1,
          image_url: null,
          is_active: true,
        },
      ]),
    ).toThrow();
  });
});
