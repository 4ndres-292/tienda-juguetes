"use client";

import type { Product } from "@/features/products/types/product";
import { useReservation } from "@/features/reservations/components/ReservationProvider";

export function ReservationButton({ product }: { product: Product }) {
  const { addProduct, items } = useReservation();
  const currentItem = items.find((item) => item.productId === product.id);
  const isAvailable = product.isActive && product.stock > 0;

  function handleAdd(): void {
    addProduct({
      productId: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    });
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!isAvailable}
      className="mt-4 w-full rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:bg-stone-300"
    >
      {!isAvailable
        ? "No disponible"
        : currentItem
          ? `Agregar otro (${currentItem.quantity})`
          : "Agregar a mi reserva"}
    </button>
  );
}
