import { Suspense } from "react";
import { ProductList } from "@/features/products/components/ProductList";
import { ProductListSkeleton } from "@/features/products/components/ProductListSkeleton";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <header className="bg-brand-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-cream/80">
            Catálogo de juguetes
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Beetho
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-brand-cream sm:text-lg">
            Encuentra juguetes para compartir, imaginar y disfrutar.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="catalog-title"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="mb-6">
          <h2 id="catalog-title" className="text-2xl font-bold sm:text-3xl">
            Nuestros juguetes
          </h2>
          <p className="mt-2 text-brand-secondary">
            Explora los productos disponibles en nuestro catálogo.
          </p>
        </div>

        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList />
        </Suspense>
      </section>
    </main>
  );
}
