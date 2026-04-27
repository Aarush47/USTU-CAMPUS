import { Link, Outlet, useLocation } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Utensils,
  Menu,
  X,
  ChefHat,
  User,
} from "lucide-react";
import { useState } from "react";
import { useClerkUserSync } from "../hooks/useClerkUserSync";
import { ThemeToggle } from "./ThemeToggle";
import siteLogo from "../../logo.webp";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/canteen" },
  { icon: Utensils, label: "Menu Management", path: "/canteen/menu" },
  { icon: User, label: "My Profile", path: "/canteen/profile" },
];

export function CanteenLayout() {
  useClerkUserSync();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
              <img src={siteLogo} alt="USTU Campus" className="w-24 h-auto rounded-md bg-white p-1 shadow-sm" />
              <div>
                <p className="text-xs text-muted-foreground">Canteen Portal</p>
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
                               (item.path !== "/canteen" && location.pathname.startsWith(item.path));

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

          {/* User Button */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src={siteLogo} alt="USTU Campus" className="w-24 h-auto rounded-md bg-white p-1 shadow-sm" />
          <ThemeToggle />
        </div>

        <Outlet />
      </main>
    </div>
  );
}