import "server-only";

import { z } from "zod";
import type { ReservationRequest } from "@/features/reservations/schemas/reservationRequestSchema";
import type { RegisteredReservation } from "@/features/reservations/types/reservationOrder";
import { buildRegisteredReservationWhatsAppUrl } from "@/features/reservations/utils/registeredReservationWhatsApp";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/server";

const createdOrderRowSchema = z.object({
  order_id: z.union([z.string(), z.number()]).transform(String),
  public_code: z.string().regex(/^RES-\d{4,}$/),
  total: z.coerce.number().finite().nonnegative(),
});

export async function createReservationOrder(
  request: ReservationRequest,
): Promise<RegisteredReservation | null> {
  const supabase = createPrivilegedSupabaseClient();
  const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const { data, error } = await supabase.rpc("create_pending_order", {
    p_customer_name: request.customerName,
    p_customer_phone: request.customerPhone,
    p_idempotency_key: request.idempotencyKey,
    p_items: request.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_source: "web",
  });
  const parsedRow = createdOrderRowSchema.safeParse(Array.isArray(data) ? data[0] : data);

  if (error || !parsedRow.success || !whatsAppNumber) {
    console.error("Reservation creation failed", {
      hasDatabaseError: Boolean(error),
      hasValidResponse: parsedRow.success,
      hasWhatsAppNumber: Boolean(whatsAppNumber),
    });
    return null;
  }

  const itemCount = request.items.reduce((total, item) => total + item.quantity, 0);
  const reservationSummary = {
    publicCode: parsedRow.data.public_code,
    itemCount,
    total: parsedRow.data.total,
  };

  return {
    orderId: parsedRow.data.order_id,
    ...reservationSummary,
    whatsAppUrl: buildRegisteredReservationWhatsAppUrl(reservationSummary, whatsAppNumber),
  };
}
