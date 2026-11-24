import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updateProductAction } from "@/features/admin/actions/productActions";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { requireAdminPage } from "@/features/admin/services/adminAuthService";
import { getCategories, getProductById } from "@/features/products/services/adminProductService";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

async function EditProductContent({ params }: EditProductPageProps) {
  await requireAdminPage();

  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const action = updateProductAction.bind(null, product.id);

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-primary">Editar producto</h1>
      <p className="mb-6 mt-2 text-brand-secondary">Actualiza la información de {product.name}.</p>
      <ProductForm action={action} categories={categories} product={product} />
    </>
  );
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-3xl bg-white" />}>
        <EditProductContent params={params} />
      </Suspense>
    </main>
  );
}
