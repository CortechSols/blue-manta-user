import { useState } from "react";
import type { ReactNode } from "react";
import {
  BarChart3,
  Calendar,
  Database,
  History,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  User,
  LogOut,
  Bot,
  Menu,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
// Organizations feature temporarily disabled
// import {
//   useOrganizations,
//   getOrganizationFullName,
//   type Organization,
// } from "@/hooks/useOrganizations";
import { useAuthActions } from "@/stores/authStore";

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "App Calendar", path: "/calendar" },
  { icon: Database, label: "Data Sources", path: "/data" },
  { icon: Bot, label: "Chatbots", path: "/chatbots" },
  { icon: History, label: "Chat History", path: "/chat-history" },
  { icon: ShieldCheck, label: "Quality Assurance", path: "/qa" },
  { icon: Zap, label: "Integrations", path: "/integrations" },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  activePath: string;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  activePath,
}: DashboardLayoutProps) {
  // Organizations feature temporarily disabled
  // const { data: organizations, isLoading, error } = useOrganizations();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex max-h-screen">
      {/* Desktop Sidebar - Always visible on lg+ screens */}
      <div className="hidden lg:flex bg-[#CAF0F8] max-h-screen overflow-y-auto">
        {/* Icon Section */}
        <div className="w-20 flex flex-col items-center py-6">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/bml-side-logo.png"
              alt="Blue Manta Labs"
              className="w-12 h-12 object-contain"
            />
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col gap-4 flex-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors text-[#0077B6] ${
                  activePath === item.path ? "bg-white/30" : "hover:bg-white/20"
                }`}
                title={item.label}
              >
                <item.icon className="w-6 h-6" />
              </Link>
            ))}
          </div>

          {/* Settings and Logout at bottom */}
          <div className="flex flex-col gap-2">
            <Link
              to="/settings"
              className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer text-[#0077B6] hover:bg-white/20"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer text-[#0077B6] hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Desktop Text Labels Section */}
        <div className="w-40 bg-[#EBF9FC] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-center flex-col gap-2 py-6">
            <img src="/bml-logo.png" alt="Manta" className="w-8" />
            <span
              className="font-semibold text-sm text-center whitespace-nowrap"
              style={{ color: "#0077B6" }}
            >
              Manta Engage
            </span>
          </div>

          {/* Navigation Items - Aligned with icons */}
          <div className="flex flex-col gap-4 flex-1 px-3">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`h-12 flex items-center px-3 rounded-lg cursor-pointer transition-colors text-[#0077B6] text-sm whitespace-nowrap ${
                  activePath === item.path
                    ? "bg-[#E0F2FE]"
                    : "hover:bg-[#E0F2FE]/50"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Settings and Logout at bottom - Aligned with icons */}
          <div className="px-3 pb-6 space-y-2">
            <Link
              to="/settings"
              className="h-12 flex items-center px-3 rounded-lg cursor-pointer transition-colors text-[#0077B6] text-sm hover:bg-[#E0F2FE]/50"
            >
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="h-12 flex w-full items-center px-3 rounded-lg cursor-pointer transition-colors text-[#0077B6] text-sm hover:bg-red-50 hover:text-red-600"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileSidebar}
          />

          {/* Mobile Sidebar */}
          <div className="fixed left-0 top-0 bottom-0 z-50 bg-[#CAF0F8] flex lg:hidden">
            {/* Icon Section */}
            <div className="w-20 flex flex-col items-center py-6">
              {/* Logo */}
              <div className="mb-8">
                <img
                  src="/bml-side-logo.png"
                  alt="Blue Manta Labs"
                  className="w-12 h-12 object-contain"
                />
              </div>

              {/* Navigation Icons */}
              <div className="flex flex-col gap-4 flex-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors text-[#0077B6] ${
                      activePath === item.path
                        ? "bg-white/30"
                        : "hover:bg-white/20"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                  </Link>
                ))}
              </div>

              {/* Settings and Logout at bottom */}
              <div className="flex flex-col gap-2">
                <Link
                  to="/settings"
                  onClick={closeMobileSidebar}
                  className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer text-[#0077B6] hover:bg-white/20"
                >
                  <Settings className="w-6 h-6" />
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileSidebar();
                  }}
                  className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer text-[#0077B6] hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Mobile Text Labels Section */}
            <div className="w-40 bg-[#EBF9FC] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-center flex-col gap-2 py-6">
                <img src="/bml-logo.png" alt="Manta" className="w-8" />
                <span
                  className="font-semibold text-sm text-center whitespace-nowrap"
                  style={{ color: "#0077B6" }}
                >
                  Manta Engage
                </span>
              </div>

              {/* Navigation Items */}
              <div className="flex flex-col gap-4 flex-1 px-3">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`h-12 flex items-center px-3 rounded-lg cursor-pointer transition-colors text-[#0077B6] text-sm whitespace-nowrap ${
                      activePath === item.path
                        ? "bg-[#E0F2FE]"
                        : "hover:bg-[#E0F2FE]/50"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Settings and Logout at bottom */}
              <div className="px-3 pb-6 space-y-2">
                <Link
                  to="/settings"
                  onClick={closeMobileSidebar}
                  className="h-12 flex items-center px-3 rounded-lg cursor-pointer transition-colors text-[#0077B6] text-sm hover:bg-[#E0F2FE]/50"
                >
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileSidebar();
                  }}
                  className="h-12 flex w-full items-center px-3 rounded-lg cursor-pointer transition-colors text-[#0077B6] text-sm hover:bg-red-50 hover:text-red-600"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu Button - Only show on mobile */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="text-[#0077B6]"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 lg:gap-4 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hidden sm:flex"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hidden sm:flex"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-600">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <h2 className="text-lg lg:text-xl font-semibold text-[#0077B6] mb-1">
            {title}
          </h2>
          <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
