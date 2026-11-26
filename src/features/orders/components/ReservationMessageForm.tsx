"use client";

import { useActionState } from "react";
import { previewReservationAction } from "@/features/orders/actions/reservationActions";
import {
  initialReservationActionState,
  type ReservationMessageField,
} from "@/features/orders/types/order";
import { formatProductPrice } from "@/features/products/utils/productPresentation";

const fieldLabels: Record<ReservationMessageField, string> = {
  productName: "Producto",
  productCode: "Código",
  quantity: "Cantidad válida",
  referencePrice: "Precio referencial",
};

export function ReservationMessageForm() {
  const [state, formAction, pending] = useActionState(
    previewReservationAction,
    initialReservationActionState,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
      <form action={formAction} className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
        <label htmlFor="reservationMessage" className="block text-sm font-semibold text-brand-primary">
          Mensaje recibido por WhatsApp
        </label>
        <textarea
          id="reservationMessage"
          name="reservationMessage"
          rows={13}
          required
          defaultValue={state.reservationMessage}
          placeholder="Pega aquí el mensaje de reserva…"
          className="mt-2 w-full rounded-xl border border-brand-secondary/40 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-secondary/20"
        />

        {state.message ? (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {state.message}
          </p>
        ) : null}

        {state.missingFields?.length ? (
          <div className="mt-4 rounded-xl border border-red-200 p-4 text-sm text-red-700">
            <p className="font-semibold">Completa o corrige:</p>
            <ul className="mt-2 list-disc pl-5">
              {state.missingFields.map((field) => <li key={field}>{fieldLabels[field]}</li>)}
            </ul>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-secondary disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Procesando…" : "Procesar mensaje"}
        </button>
      </form>

      <section aria-live="polite" className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-brand-primary">Vista previa</h2>
        {!state.preview ? (
          <p className="mt-3 text-brand-secondary">
            Procesa un mensaje válido para comprobar el producto y calcular el total.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              <dt className="font-semibold text-brand-secondary">Producto</dt>
              <dd className="text-right font-bold text-brand-primary">{state.preview.productName}</dd>
              <dt className="font-semibold text-brand-secondary">Código</dt>
              <dd className="text-right text-brand-primary">{state.preview.productCode}</dd>
              <dt className="font-semibold text-brand-secondary">Cantidad</dt>
              <dd className="text-right text-brand-primary">{state.preview.quantity}</dd>
              <dt className="font-semibold text-brand-secondary">Precio actual</dt>
              <dd className="text-right text-brand-primary">{formatProductPrice(state.preview.currentUnitPrice)}</dd>
              <dt className="font-semibold text-brand-secondary">Total</dt>
              <dd className="text-right text-lg font-extrabold text-brand-primary">{formatProductPrice(state.preview.total)}</dd>
              <dt className="font-semibold text-brand-secondary">Stock actual</dt>
              <dd className="text-right text-brand-primary">{state.preview.currentStock}</dd>
            </dl>

            {!state.preview.referencePriceMatches ? (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                El mensaje indicaba {formatProductPrice(state.preview.referencePrice)}. Se utilizará el precio actual de PostgreSQL.
              </p>
            ) : null}
            {state.preview.requestedProductName.toLocaleLowerCase("es") !== state.preview.productName.toLocaleLowerCase("es") ? (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                El nombre del mensaje no coincide exactamente con el producto encontrado por código.
              </p>
            ) : null}
            {state.preview.quantity > state.preview.currentStock || !state.preview.isProductActive ? (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                Revisa disponibilidad y estado del producto antes de confirmar una reserva.
              </p>
            ) : null}
            <p className="rounded-xl bg-brand-cream p-3 text-sm text-brand-secondary">
              Vista previa solamente. La orden todavía no fue registrada.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
