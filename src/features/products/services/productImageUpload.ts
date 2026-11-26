import {
  getImageExtension,
  hasValidImageSignature,
  productImageSchema,
} from "@/features/products/schemas/productImageSchema";
import type { ProductImageUploadResult } from "@/features/products/services/productImageService";

export type ProductImageStorage = {
  upload: (
    path: string,
    file: File,
    options: { contentType: string; upsert: false },
  ) => PromiseLike<{ error: { status?: number } | null }>;
  getPublicUrl: (path: string) => { data: { publicUrl: string } };
};

export async function uploadValidatedProductImage(
  storage: ProductImageStorage,
  categorySlug: string,
  productCode: string,
  file: File,
  uniqueId = crypto.randomUUID(),
): Promise<ProductImageUploadResult> {
  const validation = productImageSchema.safeParse(file);

  if (!validation.success) {
    return { status: "invalid", message: validation.error.issues[0]?.message ?? "Imagen inválida" };
  }

  if (!(await hasValidImageSignature(file))) {
    return { status: "invalid", message: "El contenido del archivo no corresponde a una imagen válida." };
  }

  const extension = getImageExtension(file.type);
  const path = `${categorySlug}/${productCode}/${uniqueId}.${extension}`;
  const { error } = await storage.upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { status: "error", message: "No se pudo subir la imagen." };
  }

  const { data } = storage.getPublicUrl(path);
  return { status: "success", publicUrl: data.publicUrl, path };
}
