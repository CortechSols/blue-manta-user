import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  FileText,
  Database,
  Users,
  History,
  UserCircle,
  ShieldCheck,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      label: "App Calendar",
      icon: Calendar,
      href: "/calendar",
      active: location.pathname === "/calendar",
    },
    {
      label: "Content Generator",
      icon: FileText,
      href: "/content",
      active: location.pathname === "/content",
    },
    {
      label: "Data Sources",
      icon: Database,
      href: "/data-sources",
      active: location.pathname === "/data-sources",
    },
    {
      label: "Train Chatbot",
      icon: Users,
      href: "/train-chatbot",
      active: location.pathname === "/train-chatbot",
    },
    {
      label: "Chat History",
      icon: History,
      href: "/chat-history",
      active: location.pathname === "/chat-history",
    },
    {
      label: "Client Profile",
      icon: UserCircle,
      href: "/client-profile",
      active: location.pathname === "/client-profile",
    },
    {
      label: "Quality Assurance",
      icon: ShieldCheck,
      href: "/quality-assurance",
      active: location.pathname === "/quality-assurance",
    },
  ];

  return (
    <div className={cn("flex h-full w-64 flex-col bg-sky-50", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Logo />
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-blue-600",
                route.active ? "bg-sky-100 text-blue-600" : ""
              )}
            >
              <route.icon className="h-4 w-4" />
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-blue-600"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
