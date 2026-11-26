import {
  reservationStorageSchema,
  reservationStorageStateSchema,
} from "@/features/reservations/schemas/reservationStorageSchema";
import type { ReservationStorageState } from "@/features/reservations/types/reservation";

export const reservationStorageKey = "beetho-reservation-list";

export function parseStoredReservation(value: string | null): ReservationStorageState {
  if (!value) {
    return { idempotencyKey: null, items: [] };
  }

  try {
    const parsedValue: unknown = JSON.parse(value);
    const currentResult = reservationStorageStateSchema.safeParse(parsedValue);

    if (currentResult.success) {
      return {
        idempotencyKey: currentResult.data.idempotencyKey,
        items: currentResult.data.items.filter((item) => item.isActive && item.stock > 0),
      };
    }

    const legacyResult = reservationStorageSchema.safeParse(parsedValue);

    return {
      idempotencyKey: null,
      items: legacyResult.success
        ? legacyResult.data.filter((item) => item.isActive && item.stock > 0)
        : [],
    };
  } catch {
    return { idempotencyKey: null, items: [] };
  }
}

export function serializeReservation(state: ReservationStorageState): string {
  return JSON.stringify(state);
}
