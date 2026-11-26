import { z } from "zod";

export const reservationMessageInputSchema = z.object({
  reservationMessage: z
    .string()
    .trim()
    .min(1, "Pega el mensaje recibido por WhatsApp.")
    .max(4000, "El mensaje es demasiado extenso."),
});

export const parsedReservationMessageSchema = z.object({
  productName: z.string().trim().min(1),
  productCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2,10}-\d{3,}$/),
  quantity: z.number().int().positive(),
  referencePrice: z.number().nonnegative().finite(),
});
