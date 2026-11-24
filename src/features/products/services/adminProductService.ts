import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/features/admin/services/adminAuthService";
import {
  transformCategoryRows,
  transformProductRows,
} from "@/features/products/schemas/productSchema";
import type {
  Category,
  Product,
  ProductInput,
  ProductMutationResult,
} from "@/features/products/types/product";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/server";
import {
  createProductRecord,
  setProductActiveRecord,
  toDatabaseProduct,
  updateProductRecord,
  type ProductCrudDataSource,
} from "@/features/products/services/productCrudOperations";

const productColumns =
  "id, code, category_id, name, description, price, stock, image_url, is_active";

function parseSingleProduct(row: unknown): Product {
  const [product] = transformProductRows([row]);

  if (!product) {
    throw new Error("Product response was empty");
  }

  return product;
}

function createProductCrudDataSource(supabase: SupabaseClient): ProductCrudDataSource {
  return {
    async create(input) {
      return supabase
        .from("products")
        .insert(toDatabaseProduct(input))
        .select(productColumns)
        .single();
    },
    async update(productId, input, imageUrl) {
      const changes = imageUrl === undefined
        ? toDatabaseProduct(input)
        : { ...toDatabaseProduct(input), image_url: imageUrl };

      return supabase
        .from("products")
        .update(changes)
        .eq("id", productId)
        .select(productColumns)
        .maybeSingle();
    },
    async setActive(productId, isActive) {
      return supabase
        .from("products")
        .update({ is_active: isActive })
        .eq("id", productId)
        .select(productColumns)
        .maybeSingle();
    },
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .order("name", { ascending: true });

  if (error) {
    console.error("Admin products: query failed", { code: error.code });
    throw new Error("No se pudieron cargar los productos");
  }

  return transformProductRows(data);
}

export async function getProductById(productId: string): Promise<Product | null> {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Admin product: query failed", { code: error.code });
    throw new Error("No se pudo cargar el producto");
  }

  return data ? parseSingleProduct(data) : null;
}

export async function getCategories(): Promise<Category[]> {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Categories: query failed", { code: error.code });
    throw new Error("No se pudieron cargar las categorías");
  }

  return transformCategoryRows(data);
}

export async function createProduct(input: ProductInput): Promise<ProductMutationResult> {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  const dataSource = createProductCrudDataSource(supabase);
  return createProductRecord(dataSource, input);
}

export async function updateProduct(
  productId: string,
  input: ProductInput,
  imageUrl?: string | null,
): Promise<ProductMutationResult> {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  const dataSource = createProductCrudDataSource(supabase);
  return updateProductRecord(dataSource, productId, input, imageUrl);
}

async function setProductActive(productId: string, isActive: boolean): Promise<ProductMutationResult> {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  const dataSource = createProductCrudDataSource(supabase);
  return setProductActiveRecord(dataSource, productId, isActive);
}

export function deactivateProduct(productId: string) {
  return setProductActive(productId, false);
}

export function reactivateProduct(productId: string) {
  return setProductActive(productId, true);
}

export async function updateProductImage(productId: string, imageUrl: string) {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  return supabase.from("products").update({ image_url: imageUrl }).eq("id", productId);
}

export async function rollbackCreatedProduct(productId: string) {
  await requireAdmin();
  const supabase = createPrivilegedSupabaseClient();
  return supabase.from("products").delete().eq("id", productId);
}
