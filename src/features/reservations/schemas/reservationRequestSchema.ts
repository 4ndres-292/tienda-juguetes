import { z } from "zod";

const normalizedPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^\+?[0-9]{7,15}$/, "Ingresa un número de WhatsApp válido"));

export const reservationRequestSchema = z.object({
  customerName: z.string().trim().min(2, "Ingresa tu nombre").max(100, "El nombre es demasiado largo"),
  customerPhone: normalizedPhoneSchema,
  idempotencyKey: z.uuid("La sesión de reserva no es válida"),
  items: z.array(z.object({
    productId: z.string().regex(/^\d+$/, "Producto inválido"),
    quantity: z.number().int().min(1).max(99),
  })).min(1, "Agrega al menos un juguete").max(50).superRefine((items, context) => {
    const productIds = items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      context.addIssue({ code: "custom", message: "No se permiten productos duplicados" });
    }
  }),
});

export type ReservationRequest = z.infer<typeof reservationRequestSchema>;
