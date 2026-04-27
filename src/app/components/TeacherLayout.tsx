import { Link, Outlet, useLocation } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardList, 
  Calendar,
  FileText,
  Award,
  PenTool,
  Bell,
  Menu,
  X,
  GraduationCap,
  User,
} from "lucide-react";
import { useState } from "react";
import { useClerkUserSync } from "../hooks/useClerkUserSync";
import { ThemeToggle } from "./ThemeToggle";
import siteLogo from "../../logo.webp";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/teacher" },
  { icon: Users, label: "Classes", path: "/teacher/classes" },
  { icon: Calendar, label: "Attendance", path: "/teacher/attendance" },
  { icon: ClipboardList, label: "Assignments", path: "/teacher/assignments" },
  { icon: FileText, label: "Resources", path: "/teacher/resources" },
  { icon: Award, label: "Marks", path: "/teacher/marks" },
  { icon: Bell, label: "Notices", path: "/teacher/notices" },
  { icon: Calendar, label: "Timetable", path: "/teacher/timetable" },
  { icon: BookOpen, label: "Library PDFs", path: "/teacher/library" },
  { icon: PenTool, label: "Whiteboard", path: "/teacher/whiteboard" },
  { icon: Calendar, label: "Academic Calendar", path: "/teacher/calendar" },
  { icon: User, label: "My Profile", path: "/teacher/profile" },
];

export function TeacherLayout() {
  useClerkUserSync();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[18rem] sm:w-72 lg:w-80 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={siteLogo} alt="USTU Campus" className="h-10 sm:h-11 w-auto max-w-[7rem] rounded-md bg-white p-1 shadow-sm" />
              <div>
                <p className="text-xs text-muted-foreground">Teacher Portal</p>
              </div>
            </div>
            <button 
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                               (item.path !== "/teacher" && location.pathname.startsWith(item.path));
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium text-foreground">Teacher</p>
                <p className="text-xs text-muted-foreground">Logged in</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserButton />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card lg:hidden">
          <img src={siteLogo} alt="USTU Campus" className="h-9 w-auto max-w-[7rem] rounded-md bg-white p-1 shadow-sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-accent rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
