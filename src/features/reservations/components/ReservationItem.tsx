"use client";

import { ProductImage } from "@/features/products/components/ProductImage";
import { formatProductPrice } from "@/features/products/utils/productPresentation";
import type { ReservationItem as ReservationItemType } from "@/features/reservations/types/reservation";

type ReservationItemProps = {
  item: ReservationItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function ReservationItem({ item, onQuantityChange, onRemove }: ReservationItemProps) {
  const hasInsufficientStock = item.quantity > item.stock;

  return (
    <li className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-brand-secondary/15 py-4 last:border-0">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-brand-secondary/15">
        <ProductImage imageUrl={item.imageUrl} productName={item.name} />
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="truncate font-bold text-brand-primary">{item.name}</p>
            <p className="text-xs font-semibold text-brand-secondary">{item.code}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline"
          >
            Eliminar
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-xl border border-brand-secondary/25">
            <button
              type="button"
              aria-label={`Disminuir cantidad de ${item.name}`}
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="size-9 font-bold text-brand-primary disabled:text-stone-300"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
            <button
              type="button"
              aria-label={`Aumentar cantidad de ${item.name}`}
              onClick={() => onQuantityChange(item.quantity + 1)}
              className="size-9 font-bold text-brand-primary"
            >
              +
            </button>
          </div>
          <p className="font-bold text-brand-primary">
            {formatProductPrice(item.price * item.quantity)}
          </p>
        </div>
        {hasInsufficientStock ? (
          <p role="alert" className="mt-2 text-xs font-semibold text-amber-700">
            Stock disponible informado: {item.stock}. Se validará nuevamente al enviar.
          </p>
        ) : null}
      </div>
    </li>
  );
}
