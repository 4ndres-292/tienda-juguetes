export type ProductAvailability = {
  label: "Disponible" | "Agotado";
  isAvailable: boolean;
};

const priceFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatProductPrice(price: number): string {
  return `Bs ${priceFormatter.format(price)}`;
}

export function getProductAvailability(stock: number): ProductAvailability {
  return stock > 0
    ? { label: "Disponible", isAvailable: true }
    : { label: "Agotado", isAvailable: false };
}

export function resolveProductImageUrl(imageUrl: string | null): string | null {
  return imageUrl?.trim() || null;
}
