import type { ParsedReservationMessage, ReservationPreviewResult } from "@/features/orders/types/order";
import type { Product } from "@/features/products/types/product";

export type ProductByCodeLookup = (productCode: string) => Promise<Product | null>;

function calculateOrderTotal(unitPrice: number, quantity: number): number {
  const unitPriceInCents = Math.round(unitPrice * 100);
  return (unitPriceInCents * quantity) / 100;
}

export async function prepareReservationPreview(
  reservation: ParsedReservationMessage,
  getProductByCode: ProductByCodeLookup,
): Promise<ReservationPreviewResult> {
  const product = await getProductByCode(reservation.productCode);

  if (!product) {
    return { status: "product_not_found" };
  }

  return {
    status: "success",
    preview: {
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      requestedProductName: reservation.productName,
      quantity: reservation.quantity,
      currentUnitPrice: product.price,
      referencePrice: reservation.referencePrice,
      total: calculateOrderTotal(product.price, reservation.quantity),
      currentStock: product.stock,
      isProductActive: product.isActive,
      referencePriceMatches: product.price === reservation.referencePrice,
    },
  };
}
