import type { ReactNode } from "react";

type ProductGridProps = { children: ReactNode; ariaBusy?: boolean };

export function ProductGrid({ children, ariaBusy = false }: ProductGridProps) {
  return (
    <div aria-busy={ariaBusy} className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {children}
    </div>
  );
}
