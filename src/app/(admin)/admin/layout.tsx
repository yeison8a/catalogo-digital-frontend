
import AdminHeader from "@/components/layout/AdminHeader";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminHeader />

      <main className="mx-auto min-h-[calc(100vh-5rem)] max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
