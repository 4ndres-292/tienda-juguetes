import { z } from "zod";
import type { Product } from "@/features/products/types/product";

const databaseIdSchema = z
  .union([z.string().min(1), z.number().int().nonnegative()])
  .transform(String);

const databaseNumberSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? Number(value) : value),
  z.number().nonnegative().finite(),
);

const imageUrlSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().url().nullable(),
);

export const productRowSchema = z.object({
  id: databaseIdSchema,
  code: z.string().trim().min(1),
  category_id: databaseIdSchema,
  name: z.string().trim().min(1),
  description: z.string().trim().nullable(),
  price: databaseNumberSchema,
  stock: databaseNumberSchema.pipe(z.number().int()),
  image_url: imageUrlSchema,
  is_active: z.boolean(),
});

export const productRowsSchema = z.array(productRowSchema);

export function transformProductRows(rows: unknown): Product[] {
  const parsedRows = productRowsSchema.parse(rows);

  return parsedRows.map((row) => ({
    id: row.id,
    code: row.code,
    categoryId: row.category_id,
    name: row.name,
    description: row.description || null,
    price: row.price,
    stock: row.stock,
    imageUrl: row.image_url,
    isActive: row.is_active,
  }));
}

export const categoryRowSchema = z.object({
  id: databaseIdSchema,
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  code_prefix: z.string().trim().regex(/^[A-Z]{2,5}$/),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre del producto").max(120),
  description: z
    .string()
    .trim()
    .max(500, "La descripción es demasiado extensa")
    .transform((value) => value || null),
  price: z.coerce.number().positive("El precio debe ser mayor que cero"),
  stock: z.coerce.number().int("El stock debe ser entero").nonnegative("El stock no puede ser negativo"),
  categoryId: databaseIdSchema,
  isActive: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export function transformCategoryRows(rows: unknown) {
  return z.array(categoryRowSchema).parse(rows).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    codePrefix: row.code_prefix,
  }));
}
