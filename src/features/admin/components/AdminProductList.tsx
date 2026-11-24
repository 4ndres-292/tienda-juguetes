"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deactivateProductAction, reactivateProductAction } from "@/features/admin/actions/productActions";
import { DeleteConfirmationDialog } from "@/features/admin/components/DeleteConfirmationDialog";
import { ProductStatusBadge } from "@/features/admin/components/ProductStatusBadge";
import { ProductImage } from "@/features/products/components/ProductImage";
import type { Product } from "@/features/products/types/product";
import { formatProductPrice } from "@/features/products/utils/productPresentation";

export function AdminProductList({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return normalizedSearch
      ? products.filter((product) => `${product.name} ${product.code}`.toLocaleLowerCase("es").includes(normalizedSearch))
      : products;
  }, [products, search]);

  return (
    <div>
      <label htmlFor="product-search" className="sr-only">Buscar productos</label>
      <input
        id="product-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nombre o código"
        className="mb-6 w-full max-w-lg rounded-xl border border-brand-secondary/30 bg-white px-4 py-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-secondary/20"
      />

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-brand-secondary">No se encontraron productos.</div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => {
            const deactivateAction = deactivateProductAction.bind(null, product.id);
            const reactivateAction = reactivateProductAction.bind(null, product.id);
            return (
              <article key={product.id} className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[5rem_1fr_auto] sm:items-center">
                <div className="relative aspect-square w-20 overflow-hidden rounded-xl border border-brand-secondary/15">
                  <ProductImage imageUrl={product.imageUrl} productName={product.name} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-brand-primary">{product.name}</h2>
                    <ProductStatusBadge isActive={product.isActive} />
                  </div>
                  <p className="mt-1 text-sm text-brand-secondary">{product.code} · {formatProductPrice(product.price)} · Stock: {product.stock}</p>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-sm font-semibold text-brand-primary hover:underline">Editar</Link>
                  {product.isActive ? (
                    <DeleteConfirmationDialog productName={product.name} action={deactivateAction} />
                  ) : (
                    <form action={reactivateAction}>
                      <button className="text-sm font-semibold text-emerald-700 hover:underline">Restaurar</button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
