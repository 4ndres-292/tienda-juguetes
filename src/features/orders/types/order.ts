export type ReservationMessageField =
  | "productName"
  | "productCode"
  | "quantity"
  | "referencePrice";

export type ParsedReservationMessage = {
  productName: string;
  productCode: string;
  quantity: number;
  referencePrice: number;
};

export type ReservationMessageParseResult =
  | { status: "success"; reservation: ParsedReservationMessage }
  | { status: "incomplete"; missingFields: ReservationMessageField[] };

export type ReservationOrderPreview = {
  productId: string;
  productName: string;
  productCode: string;
  requestedProductName: string;
  quantity: number;
  currentUnitPrice: number;
  referencePrice: number;
  total: number;
  currentStock: number;
  isProductActive: boolean;
  referencePriceMatches: boolean;
};

export type ReservationPreviewResult =
  | { status: "success"; preview: ReservationOrderPreview }
  | { status: "product_not_found" };

export type ReservationActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  reservationMessage?: string;
  missingFields?: ReservationMessageField[];
  preview?: ReservationOrderPreview;
};

export const initialReservationActionState: ReservationActionState = { status: "idle" };
