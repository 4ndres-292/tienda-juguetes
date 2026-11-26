import { describe, expect, it } from "vitest";
import { productFormSchema } from "@/features/products/schemas/productSchema";

const validProduct = {
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
      price: 120.5,
      stock: 4,
      isActive: true,
    });
  });

  it("does not require or accept a product code", () => {
    const result = productFormSchema.parse({ ...validProduct, code: "MANUAL-9999" });
    expect(result).not.toHaveProperty("code");
  });

  it("rejects a negative price", () => {
    const result = productFormSchema.safeParse({ ...validProduct, price: "-1" });
    expect(result.success).toBe(false);
  });
});
