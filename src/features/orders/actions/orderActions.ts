"use server";

import { revalidatePath } from "next/cache";
import { rejectionReasonSchema } from "@/features/orders/schemas/adminOrderSchema";
import { confirmOrder, rejectOrder } from "@/features/orders/services/adminOrderService";
import type { OrderActionState } from "@/features/orders/types/adminOrder";

function revalidateOrders(orderId: string): void {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/");
}

export async function confirmOrderAction(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  const result = await confirmOrder(orderId);

  if (result.status === "success") {
    revalidateOrders(orderId);
    return result.orderStatus === "expired"
      ? { status: "error", message: "La reserva venció y ya no puede aceptarse." }
      : { status: "success", message: "Reserva aceptada y stock actualizado." };
  }

  if (result.status === "insufficient_stock") {
    return {
      status: "error",
      message: result.productCode
        ? `Stock insuficiente para ${result.productCode}. No se modificó ningún producto.`
        : "Stock insuficiente. No se modificó ningún producto.",
    };
  }

  return { status: "error", message: "No se pudo aceptar la reserva en su estado actual." };
}

export async function rejectOrderAction(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  const parsedReason = rejectionReasonSchema.safeParse(formData.get("reason") ?? "");

  if (!parsedReason.success) {
    return { status: "error", message: parsedReason.error.issues[0]?.message };
  }

  const result = await rejectOrder(orderId, parsedReason.data);

  if (result.status === "success") {
    revalidateOrders(orderId);
    return { status: "success", message: "Reserva rechazada sin modificar el stock." };
  }

  return { status: "error", message: "No se pudo rechazar la reserva en su estado actual." };
}
