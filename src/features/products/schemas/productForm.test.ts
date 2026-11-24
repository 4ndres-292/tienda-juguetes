import { describe, expect, it } from "vitest";
import { productFormSchema } from "@/features/products/schemas/productSchema";

const validProduct = {
  code: "BET-0002",
  name: "Camión de madera",
  description: "Juguete resistente",
  price: "120.50",
  stock: "4",
  categoryId: "3",
  isActive: "on",
};

describe("productFormSchema", () => {
  it("accepts and transforms a valid product", () => {
    expect(productFormSchema.parse(validProduct)).toMatchObject({
      code: "BET-0002",
      price: 120.5,
      stock: 4,
      isActive: true,
    });
  });

  it("rejects a negative price", () => {
    const result = productFormSchema.safeParse({ ...validProduct, price: "-1" });
    expect(result.success).toBe(false);
  });
});
