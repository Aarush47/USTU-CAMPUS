import { Link, Outlet, useLocation } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, UserPlus, Menu, X, Shield, ScrollText, Bell, BookOpen, User, Calendar } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: UserPlus, label: "Manage Accounts", path: "/admin/accounts" },
  { icon: ScrollText, label: "Audit Logs", path: "/admin/audit" },
  { icon: Bell, label: "Notices", path: "/admin/notices" },
  { icon: BookOpen, label: "Library PDFs", path: "/admin/library" },
  { icon: Calendar, label: "Academic Calendar", path: "/admin/calendar" },
  { icon: User, label: "My Profile", path: "/admin/profile" },
];

export function AdminLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">USTU CAMPUS</h1>
                <p className="text-xs text-muted-foreground">Administration</p>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/admin" && location.pathname.startsWith(item.path));

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                        ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
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

          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Full access</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserButton />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card lg:hidden">
          <h2 className="text-foreground font-semibold">USTU CAMPUS Admin</h2>
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

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
