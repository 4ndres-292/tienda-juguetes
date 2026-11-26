"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { reservationRequestSchema } from "@/features/reservations/schemas/reservationRequestSchema";
import { createReservationOrder } from "@/features/reservations/services/reservationOrderService";
import { publicReservationRateLimiter } from "@/features/reservations/services/publicReservationRateLimit";
import type { ReservationCreationState } from "@/features/reservations/types/reservationOrder";

function parseItems(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

async function getRequestIdentifier(): Promise<string> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";

  return createHash("sha256").update(`${forwardedFor}:${userAgent}`).digest("hex");
}

export async function createReservationAction(
  _state: ReservationCreationState,
  formData: FormData,
): Promise<ReservationCreationState> {
  if (formData.get("website")) {
    return { status: "error", message: "No se pudo registrar la solicitud." };
  }

  const parsedRequest = reservationRequestSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    idempotencyKey: formData.get("idempotencyKey"),
    items: parseItems(formData.get("items")),
  });

  if (!parsedRequest.success) {
    return {
      status: "error",
      message: "Revisa los datos de la reserva.",
      fieldErrors: parsedRequest.error.flatten().fieldErrors,
    };
  }

  const requestIdentifier = await getRequestIdentifier();

  if (!publicReservationRateLimiter.allow(requestIdentifier)) {
    return {
      status: "error",
      message: "Realizaste varias solicitudes. Espera unos minutos antes de intentar nuevamente.",
    };
  }

  const reservation = await createReservationOrder(parsedRequest.data);

  if (!reservation) {
    return {
      status: "error",
      message: "No pudimos registrar la reserva. Revisa la disponibilidad e intenta nuevamente.",
    };
  }

  return {
    status: "success",
    message: "Reserva registrada correctamente.",
    reservation,
  };
}
