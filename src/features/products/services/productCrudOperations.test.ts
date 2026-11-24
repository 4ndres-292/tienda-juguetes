import { describe, expect, it, vi } from "vitest";
import {
  createProductRecord,
  setProductActiveRecord,
  updateProductRecord,
  type ProductCrudDataSource,
} from "@/features/products/services/productCrudOperations";
import type { ProductInput } from "@/features/products/types/product";

const input: ProductInput = {
  code: "BET-0002",
  categoryId: "1",
  name: "Tren de madera",
  description: null,
  price: 100,
  stock: 5,
  isActive: true,
};

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 2,
    code: input.code,
    category_id: 1,
    name: input.name,
    description: input.description,
    price: input.price,
    stock: input.stock,
    image_url: null,
    is_active: input.isActive,
    ...overrides,
  };
}

function createDataSource(): ProductCrudDataSource {
  return {
    create: vi.fn().mockResolvedValue({ data: row(), error: null }),
    update: vi.fn().mockResolvedValue({ data: row({ name: "Tren actualizado" }), error: null }),
    setActive: vi.fn().mockImplementation((_id: string, isActive: boolean) =>
      Promise.resolve({ data: row({ is_active: isActive }), error: null }),
    ),
  };
}

describe("product CRUD operations", () => {
  it("creates a valid product", async () => {
    const dataSource = createDataSource();
    const result = await createProductRecord(dataSource, input);
    expect(result.status).toBe("success");
    expect(dataSource.create).toHaveBeenCalledWith(input);
  });

  it("rejects a duplicate code", async () => {
    const dataSource = createDataSource();
    vi.mocked(dataSource.create).mockResolvedValue({ data: null, error: { code: "23505" } });
    expect(await createProductRecord(dataSource, input)).toEqual({ status: "duplicate_code" });
  });

  it("updates product data", async () => {
    const dataSource = createDataSource();
    const result = await updateProductRecord(dataSource, "2", { ...input, name: "Tren actualizado" });
    expect(result.status === "success" ? result.product.name : null).toBe("Tren actualizado");
  });

  it("deactivates and reactivates a product", async () => {
    const dataSource = createDataSource();
    const inactive = await setProductActiveRecord(dataSource, "2", false);
    const active = await setProductActiveRecord(dataSource, "2", true);

    expect(inactive.status === "success" && inactive.product.isActive).toBe(false);
    expect(active.status === "success" && active.product.isActive).toBe(true);
  });
});
