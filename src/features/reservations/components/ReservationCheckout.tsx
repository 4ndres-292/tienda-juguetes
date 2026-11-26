"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createReservationAction } from "@/features/reservations/actions/reservationOrderActions";
import { formatProductPrice } from "@/features/products/utils/productPresentation";
import { useReservation } from "@/features/reservations/components/ReservationProvider";
import {
  initialReservationCreationState,
  type ReservationCreationState,
} from "@/features/reservations/types/reservationOrder";

export function ReservationCheckout() {
  const { clearReservation, idempotencyKey, items, total } = useReservation();

  async function submitReservation(
    state: ReservationCreationState,
    formData: FormData,
  ): Promise<ReservationCreationState> {
    const result = await createReservationAction(state, formData);

    if (result.status === "success") {
      clearReservation();
    }

    return result;
  }

  const [state, action, pending] = useActionState(
    submitReservation,
    initialReservationCreationState,
  );

  if (state.status === "success" && state.reservation) {
    return (
      <section className="rounded-3xl bg-white p-7 text-center shadow-lg sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-secondary">Reserva registrada</p>
        <h1 className="mt-3 text-3xl font-extrabold text-brand-primary">{state.reservation.publicCode}</h1>
        <p className="mt-4 text-brand-secondary">
          Tu solicitud quedó pendiente de confirmación y vencerá automáticamente después de 24 horas.
        </p>
        <p className="mt-4 text-xl font-bold text-brand-primary">
          Total referencial: {formatProductPrice(state.reservation.total)}
        </p>
        <a
          href={state.reservation.whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 block rounded-xl bg-[#25D366] px-5 py-3 font-bold text-white transition hover:brightness-95"
        >
          Enviar código por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(state.reservation?.publicCode ?? "")}
          className="mt-3 w-full rounded-xl border border-brand-secondary/30 px-5 py-3 font-semibold text-brand-primary"
        >
          Copiar código
        </button>
        <Link href="/" className="mt-5 inline-block font-semibold text-brand-secondary hover:text-brand-primary">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-brand-primary">Tu lista está vacía</h1>
        <p className="mt-2 text-brand-secondary">Agrega juguetes antes de confirmar una reserva.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-brand-primary px-5 py-3 font-bold text-white">
          Ver catálogo
        </Link>
      </section>
    );
  }

  const requestItems = items.map((item) => ({ productId: item.productId, quantity: item.quantity }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold text-brand-primary">Confirma tu reserva</h1>
        <p className="mt-2 text-sm text-brand-secondary">
          Solo necesitamos tus datos para comunicarnos sobre esta solicitud.
        </p>
        <form action={action} className="mt-7 space-y-5">
          <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
          <input type="hidden" name="items" value={JSON.stringify(requestItems)} />
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Sitio web</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="customerName" className="text-sm font-semibold text-brand-primary">Nombre</label>
            <input
              id="customerName"
              name="customerName"
              required
              maxLength={100}
              autoComplete="name"
              className="mt-2 w-full rounded-xl border border-brand-secondary/40 px-4 py-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-secondary/20"
            />
            {state.fieldErrors?.customerName?.map((message) => (
              <p key={message} className="mt-1 text-sm text-red-700">{message}</p>
            ))}
          </div>
          <div>
            <label htmlFor="customerPhone" className="text-sm font-semibold text-brand-primary">Número de WhatsApp</label>
            <input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ej. 76454746"
              className="mt-2 w-full rounded-xl border border-brand-secondary/40 px-4 py-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-secondary/20"
            />
            {state.fieldErrors?.customerPhone?.map((message) => (
              <p key={message} className="mt-1 text-sm text-red-700">{message}</p>
            ))}
          </div>
          {state.message && state.status === "error" ? (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending || !idempotencyKey}
            className="w-full rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-secondary disabled:cursor-wait disabled:opacity-50"
          >
            {pending ? "Registrando…" : "Registrar solicitud"}
          </button>
        </form>
      </section>

      <aside className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <h2 className="text-xl font-bold text-brand-primary">Resumen</h2>
        <ul className="mt-4 divide-y divide-brand-secondary/15">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-brand-secondary">{item.name} × {item.quantity}</span>
              <span className="font-bold text-brand-primary">
                {formatProductPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-brand-secondary/25 pt-4 text-lg font-extrabold text-brand-primary">
          <span>Total referencial</span>
          <span>{formatProductPrice(total)}</span>
        </div>
        <p className="mt-3 text-xs leading-5 text-brand-secondary">
          El servidor verificará nuevamente productos, cantidades y precios antes de registrar la solicitud.
        </p>
      </aside>
    </div>
  );
}
