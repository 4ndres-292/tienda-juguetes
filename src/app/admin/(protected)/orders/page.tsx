import { AdminOrderList } from "@/features/orders/components/AdminOrderList";
import { requireAdminPage } from "@/features/admin/services/adminAuthService";
import { getAdminOrders } from "@/features/orders/services/adminOrderService";

export default async function AdminOrdersPage() {
  await requireAdminPage();
  const orders = await getAdminOrders();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-brand-primary">Reservas</h1>
      <p className="mt-2 text-brand-secondary">Consulta, filtra y revisa las solicitudes registradas.</p>
      <div className="mt-7"><AdminOrderList orders={orders} /></div>
    </main>
  );
}
