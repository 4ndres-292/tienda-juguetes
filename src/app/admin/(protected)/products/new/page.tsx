import { createProductAction } from "@/features/admin/actions/productActions";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { requireAdminPage } from "@/features/admin/services/adminAuthService";
import { getCategories } from "@/features/products/services/adminProductService";
import { Suspense } from "react";

async function NewProductContent() {
  await requireAdminPage();

  const categories = await getCategories();

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-primary">Nuevo producto</h1>
      <p className="mb-6 mt-2 text-brand-secondary">Completa la información del juguete.</p>
      <ProductForm action={createProductAction} categories={categories} />
    </>
  );
}

export default function NewProductPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-3xl bg-white" />}>
        <NewProductContent />
      </Suspense>
    </main>
  );
}
