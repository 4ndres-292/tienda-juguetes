import type { OrderStatus } from "@/features/orders/types/adminOrder";

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-amber-50 text-amber-800" },
  confirmed: { label: "Confirmada", className: "bg-emerald-50 text-emerald-800" },
  rejected: { label: "Rechazada", className: "bg-red-50 text-red-800" },
  expired: { label: "Vencida", className: "bg-stone-100 text-stone-700" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = statusStyles[status];

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.className}`}>{style.label}</span>;
}
