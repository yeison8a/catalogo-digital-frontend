
import { Suspense } from "react";

import EditProductScreen from "@/components/admin/EditProductScreen";

export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto max-w-3xl py-12 text-center text-slate-600"
          role="status"
        >
          Cargando producto...
        </div>
      }
    >
      <EditProductScreen />
    </Suspense>
  );
}
