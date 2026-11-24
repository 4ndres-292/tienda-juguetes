import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminLogin } from "@/features/admin/components/AdminLogin";
import { getAuthenticatedAdmin } from "@/features/admin/services/adminAuthService";

async function AdminLoginContent() {
  const admin = await getAuthenticatedAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-lg sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
          Beetho
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-primary">Administración</h1>
        <p className="mt-2 text-brand-secondary">
          Ingresa con la cuenta autorizada para gestionar el catálogo.
        </p>
        <AdminLogin />
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-cream px-4 py-10">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-white" />}>
        <AdminLoginContent />
      </Suspense>
    </main>
  );
}
