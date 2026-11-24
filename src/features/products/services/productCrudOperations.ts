import { transformProductRows } from "@/features/products/schemas/productSchema";
import type {
  Product,
  ProductInput,
  ProductMutationResult,
} from "@/features/products/types/product";

type MutationResponse = {
  data: unknown;
  error: { code?: string } | null;
};

export type ProductCrudDataSource = {
  create: (input: ProductInput) => Promise<MutationResponse>;
  update: (
    productId: string,
    input: ProductInput,
    imageUrl?: string | null,
  ) => Promise<MutationResponse>;
  setActive: (productId: string, isActive: boolean) => Promise<MutationResponse>;
};

function parseMutationResponse(response: MutationResponse): ProductMutationResult {
  if (response.error?.code === "23505") {
    return { status: "duplicate_code" };
  }

  if (response.error) {
    return { status: "error" };
  }

  if (!response.data) {
    return { status: "not_found" };
  }

  const [product] = transformProductRows([response.data]);
  return product ? { status: "success", product } : { status: "not_found" };
}

export async function createProductRecord(
  dataSource: ProductCrudDataSource,
  input: ProductInput,
) {
  return parseMutationResponse(await dataSource.create(input));
}

export async function updateProductRecord(
  dataSource: ProductCrudDataSource,
  productId: string,
  input: ProductInput,
  imageUrl?: string | null,
) {
  return parseMutationResponse(await dataSource.update(productId, input, imageUrl));
}

export async function setProductActiveRecord(
  dataSource: ProductCrudDataSource,
  productId: string,
  isActive: boolean,
) {
  return parseMutationResponse(await dataSource.setActive(productId, isActive));
}

export function toDatabaseProduct(input: ProductInput) {
  return {
    code: input.code,
    category_id: input.categoryId,
    name: input.name,
    description: input.description,
    price: input.price,
    stock: input.stock,
    is_active: input.isActive,
  };
}

export function productWithImage(product: Product, imageUrl: string | null): Product {
  return { ...product, imageUrl };
}
