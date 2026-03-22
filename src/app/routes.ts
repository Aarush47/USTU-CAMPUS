import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { NoticeBoard } from "./components/NoticeBoard";
import { Timetable } from "./components/Timetable";
import { Library } from "./components/Library";
import { Attendance } from "./components/Attendance";
import { Fees } from "./components/Fees";
import { Feedback } from "./components/Feedback";
import { MyProfile } from "./components/MyProfile";
import { Marks } from "./components/Marks";
import { CalendarView } from "./components/CalendarView";
import { Whiteboard } from "./components/Whiteboard";
import { Canteen } from "./components/Canteen";
import { SignInPage } from "./pages/SignInPage";
import { UpdatedSignUpPage } from "./pages/UpdatedSignUpPage";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { TeacherProtectedLayout } from "./components/TeacherProtectedLayout";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { TeacherClasses } from "./pages/teacher/TeacherClasses";
import { TeacherAttendance } from "./pages/teacher/TeacherAttendance";
import { TeacherAssignments } from "./pages/teacher/TeacherAssignments";
import { TeacherResources } from "./pages/teacher/TeacherResources";
import { ManageStudents } from "./pages/teacher/ManageStudents";

export const router = createBrowserRouter([
  { path: "/sign-in", Component: SignInPage },
  { path: "/sign-up", Component: UpdatedSignUpPage },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "notices", Component: NoticeBoard },
      { path: "timetable", Component: Timetable },
      { path: "library", Component: Library },
      { path: "attendance", Component: Attendance },
      { path: "fees", Component: Fees },
      { path: "feedback", Component: Feedback },
      { path: "profile", Component: MyProfile },
      { path: "marks", Component: Marks },
      { path: "calendar", Component: CalendarView },
      { path: "whiteboard", Component: Whiteboard },
      { path: "canteen", Component: Canteen },
    ],
  },
  {
    path: "/teacher",
    Component: TeacherProtectedLayout,
    children: [
      { index: true, Component: TeacherDashboard },
      { path: "classes", Component: TeacherClasses },
      { path: "attendance", Component: TeacherAttendance },
      { path: "assignments", Component: TeacherAssignments },
      { path: "resources", Component: TeacherResources },
      { path: "students", Component: ManageStudents },
    ],
  },
]);
