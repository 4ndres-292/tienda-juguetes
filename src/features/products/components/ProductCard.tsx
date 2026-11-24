import { ProductImage } from "@/features/products/components/ProductImage";
import { WhatsAppButton } from "@/features/products/components/WhatsAppButton";
import type { Product } from "@/features/products/types/product";
import { formatProductPrice, getProductAvailability } from "@/features/products/utils/productPresentation";

type ProductCardProps = { product: Product };

export function ProductCard({ product }: ProductCardProps) {
  const availability = getProductAvailability(product.stock);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-secondary/20 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-secondary/40 hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden border-b border-brand-secondary/10">
        <ProductImage imageUrl={product.imageUrl} productName={product.name} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 text-xs font-semibold uppercase tracking-wide text-brand-secondary">{product.code}</p>
          <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${availability.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
            {availability.label}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-brand-primary sm:text-lg">{product.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-brand-secondary">
          {product.description || "Un juguete para crear momentos especiales."}
        </p>
        <p className="mt-auto pt-4 text-lg font-extrabold text-brand-primary sm:text-xl">{formatProductPrice(product.price)}</p>
        <WhatsAppButton product={product} />
      </div>
    </article>
  );
}
