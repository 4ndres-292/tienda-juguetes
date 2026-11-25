import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beetho | Juguetes para disfrutar",
  description: "Explora el catálogo de juguetes de Beetho.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
