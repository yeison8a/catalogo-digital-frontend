
import AdminProductList from "@/components/admin/AdminProductList";
import { mockProducts } from "@/mocks/products";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Gestión de productos
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Consulta y administra los productos
          registrados en tu catálogo.
        </p>
      </div>

      <AdminProductList products={mockProducts} />
    </div>
  );
}
