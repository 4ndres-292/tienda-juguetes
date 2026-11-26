"use server";

import { requireAdmin } from "@/features/admin/services/adminAuthService";
import { reservationMessageInputSchema } from "@/features/orders/schemas/reservationMessageSchema";
import { parseReservationMessage } from "@/features/orders/services/reservationMessageParser";
import { prepareReservationPreview } from "@/features/orders/services/reservationPreview";
import type { ReservationActionState } from "@/features/orders/types/order";
import { getProductByCode } from "@/features/products/services/adminProductService";

export async function previewReservationAction(
  _state: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  await requireAdmin();

  const parsedInput = reservationMessageInputSchema.safeParse({
    reservationMessage: formData.get("reservationMessage"),
  });

  if (!parsedInput.success) {
    return {
      status: "error",
      message: parsedInput.error.issues[0]?.message ?? "El mensaje no es válido.",
    };
  }

  const reservationMessage = parsedInput.data.reservationMessage;
  const parsedMessage = parseReservationMessage(reservationMessage);

  if (parsedMessage.status === "incomplete") {
    return {
      status: "error",
      message: "El mensaje está incompleto o contiene datos inválidos.",
      reservationMessage,
      missingFields: parsedMessage.missingFields,
    };
  }

  const previewResult = await prepareReservationPreview(
    parsedMessage.reservation,
    getProductByCode,
  );

  if (previewResult.status === "product_not_found") {
    return {
      status: "error",
      message: `No existe un producto con el código ${parsedMessage.reservation.productCode}.`,
      reservationMessage,
    };
  }

  return {
    status: "success",
    reservationMessage,
    preview: previewResult.preview,
  };
}
