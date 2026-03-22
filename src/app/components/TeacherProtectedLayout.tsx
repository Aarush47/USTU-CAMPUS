import { TeacherRoute } from "./TeacherRoute";
import { TeacherLayout } from "./TeacherLayout";

export function TeacherProtectedLayout() {
  return (
    <TeacherRoute>
      <TeacherLayout />
    </TeacherRoute>
  );
}
