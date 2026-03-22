import { Link, Outlet, useLocation } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import { 
  LayoutDashboard, 
  Bell, 
  Calendar, 
  BookOpen, 
  UserCheck, 
  DollarSign, 
  MessageSquare, 
  User, 
  Award, 
  CalendarDays,
  PenTool,
  UtensilsCrossed,
  GraduationCap,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useSupabaseTable } from "../hooks/useSupabaseTable";
import { useClerkUserSync } from "../hooks/useClerkUserSync";

type StudentProfile = {
  name?: string;
  roll_no?: string;
  department?: string;
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Bell, label: "Notice Board", path: "/notices" },
  { icon: Calendar, label: "Timetable", path: "/timetable" },
  { icon: BookOpen, label: "Library", path: "/library" },
  { icon: UserCheck, label: "Attendance", path: "/attendance" },
  { icon: DollarSign, label: "Fees", path: "/fees" },
  { icon: MessageSquare, label: "Feedback", path: "/feedback" },
  { icon: Award, label: "Marks", path: "/marks" },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  { icon: PenTool, label: "Whiteboard", path: "/whiteboard" },
  { icon: UtensilsCrossed, label: "Canteen", path: "/canteen" },
  { icon: User, label: "My Profile", path: "/profile" },
];

export function Layout() {
  useClerkUserSync();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: profiles } = useSupabaseTable<StudentProfile>(["student_profile", "profile", "students"], {
    fallbackData: [],
  });

  const student = profiles[0];
  const initials = student?.name
    ? student.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NA";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
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
        w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">USTU CAMPUS</h1>
                <p className="text-xs text-muted-foreground">College Portal</p>
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
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Student Info & Sign Out */}
          <div className="p-4 border-t border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{student?.name ?? "No profile"}</p>
                <p className="text-xs text-muted-foreground">{student?.roll_no ?? "-"}</p>
              </div>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-card border-b border-border">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="font-semibold">USTU CAMPUS</span>
          </div>
          <div className="w-6" />
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}