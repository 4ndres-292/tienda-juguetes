import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { logoutAdminAction } from "@/features/admin/actions/authActions";
import { requireAdminPage } from "@/features/admin/services/adminAuthService";

export const instant = false;

async function ProtectedAdminShell({ children }: { children: ReactNode }) {
  await requireAdminPage();

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-brand-secondary/20 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="text-xl font-extrabold text-brand-primary">
            Beetho Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-brand-secondary hover:text-brand-primary">
              Ver catálogo
            </Link>
            <form action={logoutAdminAction}>
              <button className="rounded-full border border-brand-secondary/30 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-cream">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-brand-cream" />}>
      <ProtectedAdminShell>{children}</ProtectedAdminShell>
    </Suspense>
  );
}
