import { ProductGrid } from "@/features/products/components/ProductGrid";

const skeletonItems = Array.from({ length: 10 }, (_, index) => index);

export function ProductListSkeleton() {
  return (
    <ProductGrid ariaBusy>
      {skeletonItems.map((item) => (
        <div key={item} aria-hidden="true" className="overflow-hidden rounded-2xl border border-brand-secondary/10 bg-white">
          <div className="aspect-square animate-pulse bg-brand-secondary/10" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-brand-secondary/15" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-brand-secondary/15" />
            <div className="h-4 w-full animate-pulse rounded bg-brand-secondary/10" />
            <div className="h-6 w-2/5 animate-pulse rounded bg-brand-secondary/20" />
          </div>
        </div>
      ))}
    </ProductGrid>
  );
}
