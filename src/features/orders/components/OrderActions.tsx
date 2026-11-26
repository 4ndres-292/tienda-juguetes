"use client";

import { useActionState } from "react";
import { confirmOrderAction, rejectOrderAction } from "@/features/orders/actions/orderActions";
import { initialOrderActionState } from "@/features/orders/types/adminOrder";

export function OrderActions({ orderId }: { orderId: string }) {
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmOrderAction,
    initialOrderActionState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectOrderAction,
    initialOrderActionState,
  );

  return (
    <section className="rounded-2xl border border-brand-secondary/20 bg-white p-5">
      <h2 className="text-lg font-bold text-brand-primary">Decisión</h2>
      <p className="mt-1 text-sm text-brand-secondary">
        La aceptación vuelve a validar y bloquear el inventario antes de descontarlo.
      </p>
      <form
        action={confirmAction}
        onSubmit={(event) => {
          if (!window.confirm("¿Aceptar esta reserva y descontar el stock?")) event.preventDefault();
        }}
        className="mt-5"
      >
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={confirmPending || rejectPending}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white disabled:opacity-50"
        >
          {confirmPending ? "Aceptando…" : "Aceptar reserva"}
        </button>
      </form>
      <form
        action={rejectAction}
        onSubmit={(event) => {
          if (!window.confirm("¿Rechazar esta reserva sin modificar el stock?")) event.preventDefault();
        }}
        className="mt-5"
      >
        <input type="hidden" name="orderId" value={orderId} />
        <label htmlFor="reason" className="text-sm font-semibold text-brand-primary">Motivo opcional</label>
        <textarea
          id="reason"
          name="reason"
          maxLength={500}
          rows={3}
          className="mt-2 w-full rounded-xl border border-brand-secondary/30 px-4 py-3 outline-none focus:border-brand-primary"
        />
        <button
          type="submit"
          disabled={confirmPending || rejectPending}
          className="mt-3 w-full rounded-xl bg-red-700 px-4 py-3 font-bold text-white disabled:opacity-50"
        >
          {rejectPending ? "Rechazando…" : "Rechazar reserva"}
        </button>
      </form>
      {[confirmState, rejectState].map((state, index) => state.message ? (
        <p
          key={`${state.status}-${index}`}
          role={state.status === "error" ? "alert" : "status"}
          className={`mt-3 rounded-xl p-3 text-sm ${state.status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}
        >
          {state.message}
        </p>
      ) : null)}
    </section>
  );
}
