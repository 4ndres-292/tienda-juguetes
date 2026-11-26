import type { ReservationItem } from "@/features/reservations/types/reservation";

type ReservationProduct = Omit<ReservationItem, "quantity">;

export function addReservationProduct(
  items: ReservationItem[],
  product: ReservationProduct,
): ReservationItem[] {
  if (!product.isActive || product.stock < 1) {
    return items;
  }

  const existingItem = items.find((item) => item.productId === product.productId);

  if (!existingItem) {
    return [...items, { ...product, quantity: 1 }];
  }

  return items.map((item) => item.productId === product.productId
    ? { ...item, ...product, quantity: item.quantity + 1 }
    : item);
}

export function updateReservationQuantity(
  items: ReservationItem[],
  productId: string,
  quantity: number,
): ReservationItem[] {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return items;
  }

  return items.map((item) => item.productId === productId ? { ...item, quantity } : item);
}

export function removeReservationProduct(
  items: ReservationItem[],
  productId: string,
): ReservationItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function calculateReservationTotal(items: ReservationItem[]): number {
  const totalInCents = items.reduce(
    (total, item) => total + Math.round(item.price * 100) * item.quantity,
    0,
  );

  return totalInCents / 100;
}

export function calculateReservationItemCount(items: ReservationItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
