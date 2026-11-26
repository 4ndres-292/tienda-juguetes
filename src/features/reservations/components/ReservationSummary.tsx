"use client";

import { useEffect, useState } from "react";
import { ReservationList } from "@/features/reservations/components/ReservationList";
import { useReservation } from "@/features/reservations/components/ReservationProvider";

export function ReservationSummary() {
  const { itemCount } = useReservation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-brand-primary px-5 py-3 font-bold text-white shadow-xl transition hover:bg-brand-secondary sm:bottom-6 sm:right-6"
      >
        Mi reserva ({itemCount})
      </button>
      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Cerrar lista de reserva"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <ReservationList onClose={() => setIsOpen(false)} />
        </>
      ) : null}
    </>
  );
}
