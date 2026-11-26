"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productFormSchema } from "@/features/products/schemas/productSchema";
import {
  createProduct,
  deactivateProduct,
  getCategories,
  getProductById,
  reactivateProduct,
  rollbackCreatedProduct,
  updateProduct,
  updateProductImage,
} from "@/features/products/services/adminProductService";
import {
  getProductImagePath,
  removeProductImageByPath,
  uploadProductImage,
} from "@/features/products/services/productImageService";
import type { ProductInput } from "@/features/products/types/product";
import type { AdminActionState } from "@/features/admin/types/admin";

function parseProductForm(formData: FormData) {
  return productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive"),
  });
}

function getOptionalImage(formData: FormData): File | null {
  const value = formData.get("image");
  return value instanceof File && value.size > 0 ? value : null;
}

function mutationErrorState(status: string): AdminActionState {
  if (status === "duplicate_code") {
    return {
      status: "error",
      message: "No se pudo generar un código único para el producto.",
    };
  }

  return { status: "error", message: "No se pudo guardar el producto." };
}

function revalidateProductViews() {
  revalidatePath("/");
  revalidatePath("/admin");
}

async function getValidCategory(categoryId: string) {
  const categories = await getCategories();
  return categories.find((category) => category.id === categoryId) ?? null;
}

export async function createProductAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsedProduct = parseProductForm(formData);
  const image = getOptionalImage(formData);
  const category = parsedProduct.success
    ? await getValidCategory(parsedProduct.data.categoryId)
    : null;

  if (!parsedProduct.success) {
    return {
      status: "error",
      message: "Revisa los datos ingresados.",
      fieldErrors: parsedProduct.error.flatten().fieldErrors,
    };
  }

  if (!category) {
    return {
      status: "error",
      message: "La categoría seleccionada no existe.",
      fieldErrors: { categoryId: ["Selecciona una categoría válida"] },
    };
  }

  const result = await createProduct(parsedProduct.data as ProductInput);

  if (result.status !== "success") {
    return mutationErrorState(result.status);
  }

  if (image) {
    const upload = await uploadProductImage(category.slug, result.product.code, image);

    if (upload.status !== "success") {
      await rollbackCreatedProduct(result.product.id);
      return { status: "error", message: upload.message };
    }

    const imageUpdate = await updateProductImage(result.product.id, upload.publicUrl);

    if (imageUpdate.error) {
      await removeProductImageByPath(upload.path);
      await rollbackCreatedProduct(result.product.id);
      return { status: "error", message: "No se pudo asociar la imagen al producto." };
    }
  }

  revalidateProductViews();
  redirect(`/admin?createdCode=${encodeURIComponent(result.product.code)}`);
}

export async function updateProductAction(
  productId: string,
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsedProduct = parseProductForm(formData);
  const newImage = getOptionalImage(formData);
  const category = parsedProduct.success
    ? await getValidCategory(parsedProduct.data.categoryId)
    : null;

  if (!parsedProduct.success) {
    return {
      status: "error",
      message: "Revisa los datos ingresados.",
      fieldErrors: parsedProduct.error.flatten().fieldErrors,
    };
  }

  if (!category) {
    return {
      status: "error",
      message: "La categoría seleccionada no existe.",
      fieldErrors: { categoryId: ["Selecciona una categoría válida"] },
    };
  }

  const currentProduct = await getProductById(productId);

  if (!currentProduct) {
    return { status: "error", message: "El producto ya no existe." };
  }

  let uploadedImage: { path: string; publicUrl: string } | null = null;

  if (newImage) {
    const upload = await uploadProductImage(category.slug, currentProduct.code, newImage);

    if (upload.status !== "success") {
      return { status: "error", message: upload.message };
    }

    uploadedImage = upload;
  }

  const result = await updateProduct(
    productId,
    parsedProduct.data as ProductInput,
    uploadedImage?.publicUrl,
  );

  if (result.status !== "success") {
    if (uploadedImage) {
      await removeProductImageByPath(uploadedImage.path);
    }
    return mutationErrorState(result.status);
  }

  if (uploadedImage) {
    const previousPath = getProductImagePath(currentProduct.imageUrl);
    if (previousPath) {
      await removeProductImageByPath(previousPath);
    }
  }

  revalidateProductViews();
  redirect("/admin");
}

export async function deactivateProductAction(productId: string) {
  const result = await deactivateProduct(productId);

  if (result.status !== "success") {
    throw new Error("No se pudo desactivar el producto");
  }

  revalidateProductViews();
}

export async function reactivateProductAction(productId: string) {
  const result = await reactivateProduct(productId);

  if (result.status !== "success") {
    throw new Error("No se pudo restaurar el producto");
  }

  revalidateProductViews();
}
