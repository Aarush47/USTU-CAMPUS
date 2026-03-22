import { ProtectedRoute } from "./ProtectedRoute";
import { Layout } from "./Layout";

export function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}
