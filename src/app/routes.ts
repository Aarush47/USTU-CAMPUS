import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { NoticeBoard } from "./components/NoticeBoard";
import { Timetable } from "./components/Timetable";
import { Library } from "./components/Library";
import { Attendance } from "./components/Attendance";
import { Feedback } from "./components/Feedback";
import { MyProfile } from "./components/MyProfile";
import { Marks } from "./components/Marks";
import { CalendarView } from "./components/CalendarView";
import { Whiteboard } from "./components/Whiteboard";
import { Canteen } from "./components/Canteen";
import { StudentAssignments } from "./components/StudentAssignments";
import { StudentResources } from "./components/StudentResources";
import { SignInPage } from "./pages/SignInPage";
import { UpdatedSignUpPage } from "./pages/UpdatedSignUpPage";
import { LandingPage } from "./pages/LandingPage";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { TeacherProtectedLayout } from "./components/TeacherProtectedLayout";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { TeacherClasses } from "./pages/teacher/TeacherClasses";
import { TeacherAttendance } from "./pages/teacher/TeacherAttendance";
import { TeacherAssignments } from "./pages/teacher/TeacherAssignments";
import { TeacherResources } from "./pages/teacher/TeacherResources";
import { TeacherMarks } from "./pages/teacher/TeacherMarks";
import { TeacherNotices } from "./pages/teacher/TeacherNotices";
import { TeacherTimetable } from "./pages/teacher/TeacherTimetable";
import { TeacherLibrary } from "./pages/teacher/TeacherLibrary";
import { AdminProtectedLayout } from "./components/AdminProtectedLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminAccounts } from "./pages/admin/AdminAccounts";
import { AdminAuditLogs } from "./pages/admin/AdminAuditLogs";
import { AdminNotices } from "./pages/admin/AdminNotices";
import { AdminLibrary } from "./pages/admin/AdminLibrary";
import { CanteenProtectedLayout } from "./components/CanteenProtectedLayout";
import { CanteenDashboard } from "./pages/canteen/CanteenDashboard";
import { CanteenMenuManagement } from "./pages/canteen/CanteenMenuManagement";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/sign-in", Component: SignInPage },
  { path: "/sign-up", Component: UpdatedSignUpPage },
  {
    path: "/student",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "notices", Component: NoticeBoard },
      { path: "timetable", Component: Timetable },
      { path: "library", Component: Library },
      { path: "attendance", Component: Attendance },
      { path: "assignments", Component: StudentAssignments },
      { path: "resources", Component: StudentResources },
      { path: "feedback", Component: Feedback },
      { path: "profile", Component: MyProfile },
      { path: "marks", Component: Marks },
      { path: "calendar", Component: CalendarView },
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
      { path: "marks", Component: TeacherMarks },
      { path: "notices", Component: TeacherNotices },
      { path: "timetable", Component: TeacherTimetable },
      { path: "library", Component: TeacherLibrary },
      { path: "whiteboard", Component: Whiteboard },
      { path: "calendar", Component: CalendarView },
      { path: "profile", Component: MyProfile },
    ],
  },
  {
    path: "/admin",
    Component: AdminProtectedLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "accounts", Component: AdminAccounts },
      { path: "audit", Component: AdminAuditLogs },
      { path: "notices", Component: AdminNotices },
      { path: "library", Component: AdminLibrary },
      { path: "calendar", Component: CalendarView },
      { path: "profile", Component: MyProfile },
    ],
  },
  {
    path: "/canteen",
    Component: CanteenProtectedLayout,
    children: [
      { index: true, Component: CanteenDashboard },
      { path: "menu", Component: CanteenMenuManagement },
      { path: "profile", Component: MyProfile },
    ],
  },
]);
