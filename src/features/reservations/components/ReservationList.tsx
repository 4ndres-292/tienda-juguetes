"use client";

import Link from "next/link";
import { formatProductPrice } from "@/features/products/utils/productPresentation";
import { ReservationItem } from "@/features/reservations/components/ReservationItem";
import { useReservation } from "@/features/reservations/components/ReservationProvider";

export function ReservationList({ onClose }: { onClose: () => void }) {
  const { clearReservation, items, removeProduct, total, updateQuantity } = useReservation();

  return (
    <aside
      aria-label="Mi lista de reserva"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
    >
      <header className="flex items-center justify-between border-b border-brand-secondary/20 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">Beetho</p>
          <h2 className="text-xl font-bold text-brand-primary">Mi reserva</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar lista de reserva"
          className="rounded-full border border-brand-secondary/25 px-3 py-2 font-bold text-brand-primary"
        >
          ×
        </button>
      </header>

      {items.length === 0 ? (
        <div className="grid flex-1 place-items-center px-8 text-center">
          <div>
            <p className="text-lg font-bold text-brand-primary">Tu lista está vacía</p>
            <p className="mt-2 text-sm text-brand-secondary">
              Agrega uno o varios juguetes desde el catálogo.
            </p>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex-1 overflow-y-auto px-5">
            {items.map((item) => (
              <ReservationItem
                key={item.productId}
                item={item}
                onQuantityChange={(quantity) => updateQuantity(item.productId, quantity)}
                onRemove={() => removeProduct(item.productId)}
              />
            ))}
          </ul>
          <footer className="border-t border-brand-secondary/20 bg-brand-cream p-5">
            <div className="flex items-center justify-between text-lg font-extrabold text-brand-primary">
              <span>Total referencial</span>
              <span>{formatProductPrice(total)}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-brand-secondary">
              Precios y stock se validarán en el servidor antes de registrar la solicitud.
            </p>
            <Link
              href="/reservation"
              onClick={onClose}
              className="mt-4 block w-full rounded-xl bg-brand-primary px-4 py-3 text-center font-bold text-white transition hover:bg-brand-secondary"
            >
              Continuar con la reserva
            </Link>
            <button
              type="button"
              onClick={clearReservation}
              className="mt-3 w-full text-sm font-semibold text-brand-secondary underline-offset-2 hover:underline"
            >
              Vaciar lista
            </button>
          </footer>
        </>
      )}
    </aside>
  );
}
