"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { productImageConfig } from "@/features/products/schemas/productImageSchema";

type ProductImageUploadProps = {
  currentImageUrl?: string | null;
  errorMessages?: string[];
};

export function ProductImageUpload({
  currentImageUrl = null,
  errorMessages = [],
}: ProductImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl(currentImageUrl);
      setClientError(null);
      return;
    }

    if (!productImageConfig.allowedMimeTypes.includes(
      file.type as (typeof productImageConfig.allowedMimeTypes)[number],
    )) {
      event.target.value = "";
      setClientError("Usa una imagen JPEG, PNG o WebP.");
      return;
    }

    if (file.size > productImageConfig.maxBytes) {
      event.target.value = "";
      setClientError("La imagen no debe superar 2 MB.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setClientError(null);
  }

  return (
    <div>
      <label htmlFor="image" className="block text-sm font-semibold text-brand-primary">
        Fotografía principal
      </label>
      <div className="mt-2 grid gap-4 sm:grid-cols-[9rem_1fr] sm:items-center">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-brand-secondary/20 bg-brand-cream">
          {previewUrl ? (
            <Image src={previewUrl} alt="Vista previa del producto" fill unoptimized={previewUrl.startsWith("blob:")} className="object-contain p-2" />
          ) : (
            <div className="grid h-full place-items-center p-3 text-center text-xs text-brand-secondary">
              Sin imagen
            </div>
          )}
        </div>
        <div>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-secondary"
          />
          <p className="mt-2 text-xs text-brand-secondary">JPEG, PNG o WebP. Máximo 2 MB.</p>
          {[clientError, ...errorMessages].filter(Boolean).map((message) => (
            <p key={message} className="mt-1 text-sm text-red-700">{message}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
