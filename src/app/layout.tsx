
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi Tienda | Catálogo Digital",
  description:
    "Explora nuestro catálogo de productos y encuentra lo que necesitas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground">
        <Header />

        <main>{children}</main>
      </body>
    </html>
  );
}
