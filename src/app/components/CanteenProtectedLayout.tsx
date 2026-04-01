import { CanteenRoute } from "./CanteenRoute";
import { CanteenLayout } from "./CanteenLayout";

export function CanteenProtectedLayout() {
  return (
    <CanteenRoute>
      <CanteenLayout />
    </CanteenRoute>
  );
}