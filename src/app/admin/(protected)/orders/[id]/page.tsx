import { notFound } from "next/navigation";
import { formatProductPrice } from "@/features/products/utils/productPresentation";
import { OrderActions } from "@/features/orders/components/OrderActions";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { requireAdminPage } from "@/features/admin/services/adminAuthService";
import { getAdminOrderById } from "@/features/orders/services/adminOrderService";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  await requireAdminPage();
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-secondary">Reserva</p>
          <h1 className="text-3xl font-bold text-brand-primary">{order.publicCode}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-primary">Cliente</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-brand-secondary">Nombre</dt><dd className="font-semibold">{order.customerName}</dd></div>
              <div><dt className="text-brand-secondary">WhatsApp</dt><dd className="font-semibold">{order.customerPhone}</dd></div>
              <div><dt className="text-brand-secondary">Creada</dt><dd>{new Date(order.createdAt).toLocaleString("es-BO")}</dd></div>
              <div><dt className="text-brand-secondary">Vence</dt><dd>{new Date(order.expiresAt).toLocaleString("es-BO")}</dd></div>
            </dl>
          </section>

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <h2 className="px-6 pt-6 text-lg font-bold text-brand-primary">Juguetes</h2>
            <div className="overflow-x-auto">
              <table className="mt-4 min-w-full text-left text-sm">
                <thead className="border-y border-brand-secondary/15 text-brand-secondary">
                  <tr><th className="px-6 py-3">Producto</th><th className="px-4 py-3">Cantidad</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Precio</th><th className="px-6 py-3">Subtotal</th></tr>
                </thead>
                <tbody className="divide-y divide-brand-secondary/15">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4"><span className="font-bold text-brand-primary">{item.productName}</span><span className="block text-xs text-brand-secondary">{item.productCode}</span></td>
                      <td className="px-4 py-4">{item.quantity}</td>
                      <td className={`px-4 py-4 font-semibold ${item.currentStock < item.quantity || !item.isActive ? "text-red-700" : "text-emerald-700"}`}>{item.currentStock}</td>
                      <td className="px-4 py-4">{formatProductPrice(item.unitPrice)}</td>
                      <td className="px-6 py-4 font-bold">{formatProductPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-brand-secondary/15 px-6 py-5 text-right text-xl font-extrabold text-brand-primary">
              Total: {formatProductPrice(order.total)}
            </p>
          </section>
        </div>

        <div>
          {order.status === "pending" ? <OrderActions orderId={order.id} /> : (
            <section className="rounded-2xl bg-white p-5 text-sm text-brand-secondary shadow-sm">
              Esta reserva ya no admite cambios.
              {order.rejectionReason ? <p className="mt-3"><strong>Motivo:</strong> {order.rejectionReason}</p> : null}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
