import "server-only";

import { adminOrderRowSchema } from "@/features/orders/schemas/adminOrderSchema";
import { requireAdmin } from "@/features/admin/services/adminAuthService";
import type {
  AdminOrderDetail,
  AdminOrderSummary,
  OrderMutationResult,
} from "@/features/orders/types/adminOrder";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/server";

const orderSelect = `
  id,
  public_code,
  customer_name,
  customer_phone,
  total,
  status,
  created_at,
  expires_at,
  confirmed_at,
  rejected_at,
  rejection_reason,
  order_items (
    id,
    product_id,
    product_code,
    quantity,
    unit_price,
    subtotal,
    products (name, stock, is_active)
  )
`;

async function getAuthorizedClient() {
  await requireAdmin();
  return createPrivilegedSupabaseClient();
}

function transformOrderSummary(row: unknown): AdminOrderSummary | null {
  const parsedRow = adminOrderRowSchema.safeParse(row);

  if (!parsedRow.success) {
    return null;
  }

  return {
    id: parsedRow.data.id,
    publicCode: parsedRow.data.public_code,
    customerName: parsedRow.data.customer_name,
    customerPhone: parsedRow.data.customer_phone,
    total: parsedRow.data.total,
    status: parsedRow.data.status,
    createdAt: parsedRow.data.created_at,
    expiresAt: parsedRow.data.expires_at,
    productCount: parsedRow.data.order_items.length,
  };
}

function transformOrderDetail(row: unknown): AdminOrderDetail | null {
  const parsedRow = adminOrderRowSchema.safeParse(row);

  if (!parsedRow.success) {
    return null;
  }

  return {
    id: parsedRow.data.id,
    publicCode: parsedRow.data.public_code,
    customerName: parsedRow.data.customer_name,
    customerPhone: parsedRow.data.customer_phone,
    total: parsedRow.data.total,
    status: parsedRow.data.status,
    createdAt: parsedRow.data.created_at,
    expiresAt: parsedRow.data.expires_at,
    confirmedAt: parsedRow.data.confirmed_at ?? null,
    rejectedAt: parsedRow.data.rejected_at ?? null,
    rejectionReason: parsedRow.data.rejection_reason ?? null,
    items: parsedRow.data.order_items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productCode: item.product_code,
      productName: item.products?.name ?? "Producto no disponible",
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
      currentStock: item.products?.stock ?? 0,
      isActive: item.products?.is_active ?? false,
    })),
  };
}

async function expirePendingOrders(): Promise<void> {
  const supabase = createPrivilegedSupabaseClient();
  const { error } = await supabase.rpc("expire_pending_orders");

  if (error) {
    console.error("Order expiration failed", { code: error.code });
  }
}

export async function getAdminOrders(): Promise<AdminOrderSummary[]> {
  const supabase = await getAuthorizedClient();

  await expirePendingOrders();
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin orders query failed", { code: error.code });
    return [];
  }

  return (data ?? []).map(transformOrderSummary).filter((order): order is AdminOrderSummary => Boolean(order));
}

export async function getAdminOrderById(orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = await getAuthorizedClient();

  await expirePendingOrders();
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Admin order detail query failed", { code: error.code });
    return null;
  }

  return transformOrderDetail(data);
}

export async function confirmOrder(orderId: string): Promise<OrderMutationResult> {
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase.rpc("confirm_pending_order", { p_order_id: orderId });

  if (!error && (data === "confirmed" || data === "expired")) {
    return { status: "success", orderStatus: data };
  }

  if (error?.message.includes("Insufficient stock")) {
    const productCode = error.message.match(/product ([A-Z]+-\d+)/)?.[1];
    return { status: "insufficient_stock", productCode };
  }

  if (error?.code === "P0002") {
    return { status: "not_found" };
  }

  if (error?.code === "P0001") {
    return { status: "invalid_state" };
  }

  console.error("Order confirmation failed", { code: error?.code });
  return { status: "error" };
}

export async function rejectOrder(
  orderId: string,
  reason: string,
): Promise<OrderMutationResult> {
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase.rpc("reject_pending_order", {
    p_order_id: orderId,
    p_reason: reason || null,
  });

  if (!error && data === "rejected") {
    return { status: "success", orderStatus: "rejected" };
  }

  if (error?.code === "P0002") {
    return { status: "not_found" };
  }

  if (error?.code === "P0001") {
    return { status: "invalid_state" };
  }

  console.error("Order rejection failed", { code: error?.code });
  return { status: "error" };
}
