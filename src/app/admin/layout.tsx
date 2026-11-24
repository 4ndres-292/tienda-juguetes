import type { ReactNode } from "react";

// La administración depende siempre de una sesión y no necesita shell público prefabricado.
export const instant = false;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
