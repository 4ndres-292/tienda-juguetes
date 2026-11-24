import { createClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import { transformProductRows } from "@/features/products/schemas/productSchema";
import type { ProductListResult } from "@/features/products/types/product";

const productColumns =
  "id, code, category_id, name, description, price, stock, image_url, is_active";

type ProductQueryResponse = {
  data: unknown;
  error: { message: string } | null;
};

export type ProductDataSource = {
  getActiveProductRows: () => Promise<ProductQueryResponse>;
};

function createProductDataSource(): ProductDataSource | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false },
  });

  return {
    async getActiveProductRows() {
      return supabase
        .from("products")
        .select(productColumns)
        .eq("is_active", true)
        .order("name", { ascending: true });
    },
  };
}

export async function getActiveProducts(
  dataSource: ProductDataSource | null = createProductDataSource(),
): Promise<ProductListResult> {
  if (!dataSource) {
    console.error("Catálogo: faltan variables públicas de conexión a Supabase");
    return {
      status: "error",
      message: "No pudimos cargar los productos en este momento.",
    };
  }

  try {
    const { data, error } = await dataSource.getActiveProductRows();

    if (error) {
      console.error("Catálogo: falló la consulta de productos", {
        message: error.message,
      });
      return {
        status: "error",
        message: "No pudimos cargar los productos en este momento.",
      };
    }

    return { status: "success", products: transformProductRows(data) };
  } catch (error: unknown) {
    const errorType = error instanceof ZodError ? "invalid_product_data" : "unknown";
    console.error("Catálogo: no se pudo procesar la respuesta", { errorType });
    return {
      status: "error",
      message: "No pudimos cargar los productos en este momento.",
    };
  }
}
