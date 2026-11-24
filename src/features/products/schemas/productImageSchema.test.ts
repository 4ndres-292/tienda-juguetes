import { describe, expect, it } from "vitest";
import { productImageSchema } from "@/features/products/schemas/productImageSchema";

describe("productImageSchema", () => {
  it("accepts supported images within the size limit", () => {
    const image = new File([new Uint8Array(100)], "toy.webp", { type: "image/webp" });
    expect(productImageSchema.safeParse(image).success).toBe(true);
  });

  it("rejects unsupported and oversized images", () => {
    const invalidType = new File(["text"], "toy.txt", { type: "text/plain" });
    const oversized = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "toy.png", { type: "image/png" });

    expect(productImageSchema.safeParse(invalidType).success).toBe(false);
    expect(productImageSchema.safeParse(oversized).success).toBe(false);
  });
});
