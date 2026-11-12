
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi Tienda | Catálogo Digital",
  description:
    "Explora nuestro catálogo de productos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
