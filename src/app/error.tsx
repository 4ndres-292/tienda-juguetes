"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Error al renderizar el catálogo", { digest: error.digest });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-brand-cream px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-brand-primary">
          No pudimos mostrar el catálogo
        </h1>
        <p className="mt-3 text-brand-secondary">
          Ocurrió un problema inesperado. Intenta nuevamente en unos momentos.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-brand-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-secondary"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
