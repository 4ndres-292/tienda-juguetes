export type OrderStatus = "pending" | "confirmed" | "rejected" | "expired";

export type AdminOrderSummary = {
  id: string;
  publicCode: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  expiresAt: string;
  productCount: number;
};

export type AdminOrderItem = {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  currentStock: number;
  isActive: boolean;
};

export type AdminOrderDetail = Omit<AdminOrderSummary, "productCount"> & {
  confirmedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  items: AdminOrderItem[];
};

export type OrderMutationResult =
  | { status: "success"; orderStatus: OrderStatus }
  | { status: "not_found" }
  | { status: "insufficient_stock"; productCode?: string }
  | { status: "invalid_state" }
  | { status: "error" };

export type OrderActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialOrderActionState: OrderActionState = { status: "idle" };
