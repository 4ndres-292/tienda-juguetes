import Link from "next/link";
import { Suspense } from "react";
import { AdminProductList } from "@/features/admin/components/AdminProductList";
import { requireAdminPage } from "@/features/admin/services/adminAuthService";
import { getAdminProducts } from "@/features/products/services/adminProductService";

async function AdminProductsContent() {
  await requireAdminPage();

  const products = await getAdminProducts();

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-secondary">Catálogo</p>
          <h1 className="mt-1 text-3xl font-bold text-brand-primary">Productos</h1>
          <p className="mt-2 text-brand-secondary">Administra juguetes activos e inactivos.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-xl bg-brand-primary px-5 py-3 text-center font-bold text-white hover:bg-brand-secondary">
          Nuevo producto
        </Link>
      </div>
      <AdminProductList products={products} />
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-white" />}>
        <AdminProductsContent />
      </Suspense>
    </main>
  );
}
