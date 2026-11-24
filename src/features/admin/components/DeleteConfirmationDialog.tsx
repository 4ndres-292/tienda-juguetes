"use client";

import { useState } from "react";

type DeleteConfirmationDialogProps = {
  productName: string;
  action: () => Promise<void>;
};

export function DeleteConfirmationDialog({ productName, action }: DeleteConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="text-sm font-semibold text-red-700 hover:underline">
        Desactivar
      </button>
      {isOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="deactivate-title" className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="deactivate-title" className="text-xl font-bold text-brand-primary">Desactivar producto</h2>
            <p className="mt-3 text-brand-secondary">
              “{productName}” dejará de aparecer en el catálogo. Su información y fotografía se conservarán.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border border-brand-secondary/30 px-4 py-2 font-semibold text-brand-primary">
                Cancelar
              </button>
              <form action={action}>
                <button className="rounded-xl bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800">
                  Sí, desactivar
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
