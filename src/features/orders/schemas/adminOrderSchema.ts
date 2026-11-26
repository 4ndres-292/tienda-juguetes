import { z } from "zod";

export const orderStatusSchema = z.enum(["pending", "confirmed", "rejected", "expired"]);

const identifierSchema = z.union([z.string(), z.number()]).transform(String);

const orderItemRowSchema = z.object({
  id: identifierSchema,
  product_id: identifierSchema,
  product_code: z.string(),
  quantity: z.number().int().positive(),
  unit_price: z.coerce.number().nonnegative(),
  subtotal: z.coerce.number().nonnegative(),
  products: z.object({
    name: z.string(),
    stock: z.number().int().nonnegative(),
    is_active: z.boolean(),
  }).nullable(),
});

export const adminOrderRowSchema = z.object({
  id: identifierSchema,
  public_code: z.string(),
  customer_name: z.string(),
  customer_phone: z.string(),
  total: z.coerce.number().nonnegative(),
  status: orderStatusSchema,
  created_at: z.string(),
  expires_at: z.string(),
  confirmed_at: z.string().nullable().optional(),
  rejected_at: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  order_items: z.array(orderItemRowSchema),
});

export const rejectionReasonSchema = z.string().trim().max(500, "El motivo no puede superar 500 caracteres");
