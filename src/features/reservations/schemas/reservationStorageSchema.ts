import { z } from "zod";

export const reservationItemSchema = z.object({
  productId: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  price: z.number().finite().nonnegative(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().nullable(),
  isActive: z.boolean(),
  quantity: z.number().int().positive(),
});

export const reservationStorageSchema = z.array(reservationItemSchema).max(100);

export const reservationStorageStateSchema = z.object({
  idempotencyKey: z.uuid(),
  items: reservationStorageSchema,
});
