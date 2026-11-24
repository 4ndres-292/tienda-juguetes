"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveProductImageUrl } from "@/features/products/utils/productPresentation";

type ProductImageProps = {
  imageUrl: string | null;
  productName: string;
};

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-brand-cream p-6 text-center text-brand-secondary">
      <svg aria-hidden="true" viewBox="0 0 64 64" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="46" height="46" rx="8" />
        <circle cx="24" cy="24" r="5" />
        <path d="m13 47 13-13 9 9 6-6 10 10" />
      </svg>
      <span className="text-xs font-medium">Imagen no disponible</span>
    </div>
  );
}

export function ProductImage({ imageUrl, productName }: ProductImageProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const resolvedImageUrl = resolveProductImageUrl(imageUrl);

  if (!resolvedImageUrl || hasImageError) {
    return <ImagePlaceholder />;
  }

  return (
    <Image
      src={resolvedImageUrl}
      alt={productName}
      fill
      sizes="(min-width: 1536px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 400px) 50vw, 100vw"
      className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
      onError={() => setHasImageError(true)}
    />
  );
}
