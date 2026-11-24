import { describe, expect, it } from "vitest";
import { formatProductPrice, getProductAvailability, resolveProductImageUrl } from "@/features/products/utils/productPresentation";

describe("product presentation", () => {
  it("formats prices in bolivianos", () => {
    expect(formatProductPrice(80.5)).toBe("Bs 80,50");
  });

  it("derives availability from stock", () => {
    expect(getProductAvailability(3)).toEqual({ label: "Disponible", isAvailable: true });
    expect(getProductAvailability(0)).toEqual({ label: "Agotado", isAvailable: false });
  });

  it("uses the placeholder when an image is missing", () => {
    expect(resolveProductImageUrl(null)).toBeNull();
    expect(resolveProductImageUrl("  ")).toBeNull();
  });
});
