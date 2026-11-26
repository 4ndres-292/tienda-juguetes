import Link from "next/link";
import { Suspense } from "react";
import { AdminProductList } from "@/features/admin/components/AdminProductList";
import { requireAdminPage } from "@/features/admin/services/adminAuthService";
import { getAdminProducts } from "@/features/products/services/adminProductService";

type AdminPageProps = {
  searchParams: Promise<{ createdCode?: string | string[] }>;
};

async function AdminProductsContent({ searchParams }: AdminPageProps) {
  await requireAdminPage();

  const query = await searchParams;
  const products = await getAdminProducts();
  const createdCode = typeof query.createdCode === "string" && /^[A-Z]{2,5}-\d{4,}$/.test(query.createdCode)
    ? query.createdCode
    : null;

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
      {createdCode ? (
        <p role="status" className="mb-6 rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-800">
          Producto registrado correctamente. Código: {createdCode}
        </p>
      ) : null}
      <AdminProductList products={products} />
    </>
  );
}

export default function AdminPage({ searchParams }: AdminPageProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-white" />}>
        <AdminProductsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
