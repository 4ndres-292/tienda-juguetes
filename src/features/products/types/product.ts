export type Product = {
  id: string;
  code: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
};

export type ProductListResult =
  | { status: "success"; products: Product[] }
  | { status: "error"; message: string };

export type Category = {
  id: string;
  name: string;
  slug: string;
  codePrefix: string;
};

export type ProductInput = {
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  isActive: boolean;
};

export type ProductMutationResult =
  | { status: "success"; product: Product }
  | { status: "duplicate_code" }
  | { status: "not_found" }
  | { status: "error" };
