"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatProductPrice } from "@/features/products/utils/productPresentation";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import type { AdminOrderSummary, OrderStatus } from "@/features/orders/types/adminOrder";

export function AdminOrderList({ orders }: { orders: AdminOrderSummary[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesQuery = !normalizedQuery
        || order.publicCode.toLowerCase().includes(normalizedQuery)
        || order.customerName.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, status]);

  return (
    <>
      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_14rem]">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por código o cliente"
          className="rounded-xl border border-brand-secondary/30 px-4 py-3 outline-none focus:border-brand-primary"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus | "all")}
          className="rounded-xl border border-brand-secondary/30 px-4 py-3 outline-none focus:border-brand-primary"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="rejected">Rechazadas</option>
          <option value="expired">Vencidas</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-white p-8 text-center text-brand-secondary">
          No hay reservas que coincidan con los filtros.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-secondary/20 text-brand-secondary">
              <tr>
                <th className="px-5 py-4">Reserva</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Productos</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-secondary/15">
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4 font-bold text-brand-primary">{order.publicCode}</td>
                  <td className="px-5 py-4">{order.customerName}</td>
                  <td className="px-5 py-4">{new Date(order.createdAt).toLocaleString("es-BO")}</td>
                  <td className="px-5 py-4">{order.productCount}</td>
                  <td className="px-5 py-4 font-semibold">{formatProductPrice(order.total)}</td>
                  <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-bold text-brand-primary hover:underline">
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
