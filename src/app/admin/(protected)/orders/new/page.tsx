import { ReservationMessageForm } from "@/features/orders/components/ReservationMessageForm";
import { requireAdminPage } from "@/features/admin/services/adminAuthService";

export default async function NewOrderPage() {
  await requireAdminPage();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-secondary">Órdenes</p>
      <h1 className="mt-1 text-3xl font-bold text-brand-primary">Procesar reserva de WhatsApp</h1>
      <p className="mb-6 mt-2 max-w-3xl text-brand-secondary">
        Pega el mensaje recibido para validar el producto y calcular una vista previa con el precio actual.
      </p>
      <ReservationMessageForm />
    </main>
  );
}
