import { describe, expect, it, vi } from "vitest";
import {
  uploadValidatedProductImage,
  type ProductImageStorage,
} from "@/features/products/services/productImageUpload";

function createStorage(error: { status?: number } | null): ProductImageStorage {
  return {
    upload: vi.fn().mockResolvedValue({ error }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/image.webp" } }),
  };
}

describe("uploadValidatedProductImage", () => {
  it("uses a product path and returns the public URL", async () => {
    const storage = createStorage(null);
    const image = new File(
      [new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])],
      "toy.webp",
      { type: "image/webp" },
    );
    const result = await uploadValidatedProductImage(
      storage,
      "peluches",
      "PEL-0001",
      image,
      "unique-id",
    );

    expect(result).toEqual({
      status: "success",
      publicUrl: "https://example.com/image.webp",
      path: "peluches/PEL-0001/unique-id.webp",
    });
    expect(storage.upload).toHaveBeenCalledWith(
      "peluches/PEL-0001/unique-id.webp",
      image,
      { contentType: "image/webp", upsert: false },
    );
  });

  it("returns a safe error when Storage fails", async () => {
    const storage = createStorage({ status: 500 });
    const image = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "toy.png",
      { type: "image/png" },
    );

    expect(await uploadValidatedProductImage(
      storage,
      "vehiculos",
      "CAR-0001",
      image,
      "unique-id",
    )).toEqual({
      status: "error",
      message: "No se pudo subir la imagen.",
    });
  });
});
