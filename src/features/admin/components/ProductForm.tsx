"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ProductImageUpload } from "@/features/admin/components/ProductImageUpload";
import { initialAdminActionState, type AdminActionState } from "@/features/admin/types/admin";
import type { Category, Product } from "@/features/products/types/product";

type ProductFormProps = {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  categories: Category[];
  product?: Product;
};

function FieldErrors({ messages = [] }: { messages?: string[] }) {
  return messages.map((message) => (
    <p key={message} className="mt-1 text-sm text-red-700">{message}</p>
  ));
}

const inputClassName =
  "mt-2 w-full rounded-xl border border-brand-secondary/40 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-secondary/20";

export function ProductForm({ action, categories, product }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialAdminActionState);

  return (
    <form action={formAction} className="space-y-6 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {product ? (
          <div>
            <p className="block text-sm font-semibold text-brand-primary">Código</p>
            <p className={`${inputClassName} bg-brand-cream`} aria-label="Código del producto">{product.code}</p>
          </div>
        ) : null}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-semibold text-brand-primary">Categoría</label>
          <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""} className={inputClassName}>
            <option value="" disabled>Selecciona una categoría</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <FieldErrors messages={state.fieldErrors?.categoryId} />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-brand-primary">Nombre</label>
        <input id="name" name="name" required defaultValue={product?.name} className={inputClassName} />
        <FieldErrors messages={state.fieldErrors?.name} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-brand-primary">Descripción</label>
        <textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} className={inputClassName} />
        <FieldErrors messages={state.fieldErrors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-brand-primary">Precio (Bs)</label>
          <input id="price" name="price" type="number" min="0.01" step="0.01" required defaultValue={product?.price} className={inputClassName} />
          <FieldErrors messages={state.fieldErrors?.price} />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-semibold text-brand-primary">Stock</label>
          <input id="stock" name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} className={inputClassName} />
          <FieldErrors messages={state.fieldErrors?.stock} />
        </div>
      </div>

      <ProductImageUpload currentImageUrl={product?.imageUrl} errorMessages={state.fieldErrors?.image} />

      <label className="flex items-center gap-3 rounded-xl bg-brand-cream p-4 text-sm font-semibold text-brand-primary">
        <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} className="h-5 w-5 accent-brand-primary" />
        Producto activo y visible en el catálogo
      </label>

      {state.message ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.message}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin" className="rounded-xl border border-brand-secondary/30 px-5 py-3 text-center font-semibold text-brand-primary hover:bg-brand-cream">
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className="rounded-xl bg-brand-primary px-6 py-3 font-bold text-white hover:bg-brand-secondary disabled:cursor-wait disabled:opacity-60">
          {pending ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
