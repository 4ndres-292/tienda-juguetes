import { describe, expect, it, vi } from "vitest";
import { getActiveProducts, type ProductDataSource } from "@/features/products/services/productService";

const validRow = { id: 1, code: "BET-001", category_id: 1, name: "Osito", description: null, price: 80, stock: 10, image_url: null, is_active: true };

describe("getActiveProducts", () => {
  it("returns transformed products from its data source", async () => {
    const getActiveProductRows = vi.fn().mockResolvedValue({ data: [validRow], error: null });
    const dataSource: ProductDataSource = { getActiveProductRows };
    const result = await getActiveProducts(dataSource);

    expect(getActiveProductRows).toHaveBeenCalledOnce();
    expect(result).toEqual({ status: "success", products: [{ id: "1", code: "BET-001", categoryId: "1", name: "Osito", description: null, price: 80, stock: 10, imageUrl: null, isActive: true }] });
  });

  it("returns a safe error when the query fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const dataSource: ProductDataSource = { getActiveProductRows: vi.fn().mockResolvedValue({ data: null, error: { message: "database details" } }) };
    const result = await getActiveProducts(dataSource);

    expect(result).toEqual({ status: "error", message: "No pudimos cargar los productos en este momento." });
    consoleError.mockRestore();
  });
});
