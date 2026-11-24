import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { getActiveProducts } from "@/features/products/services/productService";
import type { ProductListResult } from "@/features/products/types/product";

export function ProductListContent({ result }: { result: ProductListResult }) {
  if (result.status === "error") {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center">
        <h3 className="text-lg font-bold text-brand-primary">No pudimos cargar el catálogo</h3>
        <p className="mt-2 text-brand-secondary">{result.message}</p>
      </div>
    );
  }

  if (result.products.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-secondary/20 bg-white p-8 text-center">
        <h3 className="text-lg font-bold text-brand-primary">Aún no hay productos disponibles</h3>
        <p className="mt-2 text-brand-secondary">Vuelve pronto para descubrir nuevos juguetes.</p>
      </div>
    );
  }

  return (
    <ProductGrid>
      {result.products.map((product) => <ProductCard key={product.id} product={product} />)}
    </ProductGrid>
  );
}

export async function ProductList() {
  const result = await getActiveProducts();
  return <ProductListContent result={result} />;
}
