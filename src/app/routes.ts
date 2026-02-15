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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
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
]);
