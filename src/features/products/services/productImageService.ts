import "server-only";

import { requireAdmin } from "@/features/admin/services/adminAuthService";
import { uploadValidatedProductImage } from "@/features/products/services/productImageUpload";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/server";

const productBucket = "products";
const publicPathMarker = "/storage/v1/object/public/products/";

export type ProductImageUploadResult =
  | { status: "success"; publicUrl: string; path: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

export async function uploadProductImage(
  categorySlug: string,
  productCode: string,
  file: File,
): Promise<ProductImageUploadResult> {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  const storage = supabase.storage.from(productBucket);
  const result = await uploadValidatedProductImage(storage, categorySlug, productCode, file);

  if (result.status === "error") {
    console.error("Product image: upload failed");
  }

  return result;
}

export async function removeProductImageByPath(path: string) {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  const { error } = await supabase.storage.from(productBucket).remove([path]);

  if (error) {
    console.error("Product image: cleanup failed", { status: error.status });
  }
}

export function getProductImagePath(publicUrl: string | null) {
  if (!publicUrl) {
    return null;
  }

  try {
    const url = new URL(publicUrl);
    const markerIndex = url.pathname.indexOf(publicPathMarker);

    return markerIndex >= 0
      ? decodeURIComponent(url.pathname.slice(markerIndex + publicPathMarker.length))
      : null;
  } catch {
    return null;
  }
}
