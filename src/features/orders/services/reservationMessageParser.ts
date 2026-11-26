import { parsedReservationMessageSchema } from "@/features/orders/schemas/reservationMessageSchema";
import type {
  ReservationMessageField,
  ReservationMessageParseResult,
} from "@/features/orders/types/order";

type ExtractedReservationFields = {
  productName?: string;
  productCode?: string;
  quantity?: number;
  referencePrice?: number;
};

const reservationFields: ReservationMessageField[] = [
  "productName",
  "productCode",
  "quantity",
  "referencePrice",
];

function normalizeMessage(message: string): string {
  return message.replace(/\r\n?/g, "\n");
}

function extractLineValue(message: string, label: RegExp): string | undefined {
  const match = message.match(new RegExp(`(?:^|\\n)\\s*${label.source}\\s*:\\s*(.*?)\\s*(?=\\n|$)`, "iu"));
  const value = match?.[1]?.replace(/\s+/g, " ").trim();
  return value || undefined;
}

function parseQuantity(value: string | undefined): number | undefined {
  const match = value?.match(/^(\d+)(?:\s*unidad(?:es)?)?$/iu);
  const quantity = match?.[1] ? Number(match[1]) : Number.NaN;
  return Number.isInteger(quantity) && quantity > 0 ? quantity : undefined;
}

function parseBolivianPrice(value: string | undefined): number | undefined {
  const numericText = value?.replace(/^Bs\.?\s*/iu, "").replace(/\s/g, "");

  if (!numericText || !/^\d[\d.,]*$/.test(numericText)) {
    return undefined;
  }

  const normalizedNumber = numericText.includes(",")
    ? numericText.replace(/\./g, "").replace(",", ".")
    : numericText;
  const price = Number(normalizedNumber);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function getMissingFields(fields: ExtractedReservationFields): ReservationMessageField[] {
  return reservationFields.filter((field) => fields[field] === undefined);
}

export function parseReservationMessage(message: string): ReservationMessageParseResult {
  const normalizedMessage = normalizeMessage(message);
  const productName = extractLineValue(normalizedMessage, /Producto/);
  const productCode = extractLineValue(normalizedMessage, /C[oó]digo/)?.toUpperCase();
  const quantity = parseQuantity(extractLineValue(normalizedMessage, /Cantidad/));
  const referencePrice = parseBolivianPrice(
    extractLineValue(normalizedMessage, /Precio\s+referencial/),
  );
  const extractedFields = { productName, productCode, quantity, referencePrice };
  const missingFields = getMissingFields(extractedFields);

  if (missingFields.length > 0) {
    return { status: "incomplete", missingFields };
  }

  const parsedReservation = parsedReservationMessageSchema.safeParse(extractedFields);

  if (!parsedReservation.success) {
    const invalidFields = parsedReservation.error.issues
      .map((issue) => issue.path[0])
      .filter((field): field is ReservationMessageField =>
        typeof field === "string" && reservationFields.includes(field as ReservationMessageField));
    return { status: "incomplete", missingFields: [...new Set(invalidFields)] };
  }

  return { status: "success", reservation: parsedReservation.data };
}
