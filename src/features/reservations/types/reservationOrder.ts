export type RegisteredReservation = {
  orderId: string;
  publicCode: string;
  total: number;
  itemCount: number;
  whatsAppUrl: string;
};

export type ReservationCreationState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  reservation?: RegisteredReservation;
};

export const initialReservationCreationState: ReservationCreationState = { status: "idle" };
