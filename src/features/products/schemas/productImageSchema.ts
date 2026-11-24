import { z } from "zod";

export const productImageConfig = {
  maxBytes: 2 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
};

export const productImageSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "Selecciona una imagen")
  .refine(
    (file) => file.size <= productImageConfig.maxBytes,
    "La imagen no debe superar 2 MB",
  )
  .refine(
    (file) => productImageConfig.allowedMimeTypes.includes(
      file.type as (typeof productImageConfig.allowedMimeTypes)[number],
    ),
    "Usa una imagen JPEG, PNG o WebP",
  );

export function getImageExtension(fileType: string) {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return extensions[fileType] ?? null;
}

export async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }

  if (file.type === "image/webp") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
      && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }

  return false;
}
