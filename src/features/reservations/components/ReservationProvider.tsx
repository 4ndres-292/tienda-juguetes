"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  parseStoredReservation,
  reservationStorageKey,
  serializeReservation,
} from "@/features/reservations/services/reservationStorage";
import type {
  ReservationContextValue,
  ReservationItem,
} from "@/features/reservations/types/reservation";
import {
  addReservationProduct,
  calculateReservationItemCount,
  calculateReservationTotal,
  removeReservationProduct,
  updateReservationQuantity,
} from "@/features/reservations/utils/reservationList";

const ReservationContext = createContext<ReservationContextValue | null>(null);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ReservationItem[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    const storedState = parseStoredReservation(window.localStorage.getItem(reservationStorageKey));
    const hydrationTimer = window.setTimeout(() => {
      setItems(storedState.items);
      setIdempotencyKey(storedState.idempotencyKey ?? window.crypto.randomUUID());
      setIsStorageReady(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (isStorageReady) {
      window.localStorage.setItem(
        reservationStorageKey,
        serializeReservation({ idempotencyKey: idempotencyKey || null, items }),
      );
    }
  }, [idempotencyKey, isStorageReady, items]);

  const addProduct = useCallback((product: Omit<ReservationItem, "quantity">) => {
    setIdempotencyKey((currentKey) => currentKey || window.crypto.randomUUID());
    setItems((currentItems) => addReservationProduct(currentItems, product));
  }, []);
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((currentItems) => updateReservationQuantity(currentItems, productId, quantity));
  }, []);
  const removeProduct = useCallback((productId: string) => {
    setItems((currentItems) => removeReservationProduct(currentItems, productId));
  }, []);
  const clearReservation = useCallback(() => {
    setItems([]);
    setIdempotencyKey(window.crypto.randomUUID());
  }, []);
  const value = useMemo<ReservationContextValue>(() => ({
    items,
    idempotencyKey,
    itemCount: calculateReservationItemCount(items),
    total: calculateReservationTotal(items),
    addProduct,
    updateQuantity,
    removeProduct,
    clearReservation,
  }), [addProduct, clearReservation, idempotencyKey, items, removeProduct, updateQuantity]);

  return <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>;
}

export function useReservation(): ReservationContextValue {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error("useReservation must be used within ReservationProvider");
  }

  return context;
}
