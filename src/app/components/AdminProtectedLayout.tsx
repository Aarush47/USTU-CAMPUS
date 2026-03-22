import { AdminRoute } from "./AdminRoute";
import { AdminLayout } from "./AdminLayout";

export function AdminProtectedLayout() {
  return (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  );
}
