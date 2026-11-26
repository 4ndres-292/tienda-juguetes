import { ReservationCheckout } from "@/features/reservations/components/ReservationCheckout";

export default function ReservationPage() {
  return (
    <main className="min-h-screen bg-brand-cream px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ReservationCheckout />
      </div>
    </main>
  );
}
