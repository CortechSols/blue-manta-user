import type { ReactNode } from "react";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const sidebarItems = [
  { image: "/Img5.png", label: "Dashboard", path: "/dashboard" },
  { image: "/Img1.png", label: "Train Chatbot", path: "/train-chatbot" },
  { image: "/Img2.png", label: "Calendar", path: "/calendar" },
  { image: "/Img3.png", label: "Data Sources", path: "/data" },
  { image: "/Img4.png", label: "Chat History", path: "/chat-history" },
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
  const location = useLocation();
  const pathname = location.pathname;
  const isAdmin = pathname.includes("/settings");

  return (
    <div className="min-h-screen bg-gray-50 flex max-h-screen ">
      {/* Icon Sidebar */}
      <div
        className="w-20 flex flex-col items-center py-6 max-h-screen overflow-y-auto border-r border-gray-200"
        style={{
          backgroundColor: "#EBF9FC",
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Logo */}
        <div className="mb-8">
          <Link to="/dashboard">
            <img
              src="/bml-side-logo.png"
              alt="Blue Manta Labs"
              className="w-12 h-12 object-contain"
            />
          </Link>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col gap-8 flex-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`cursor-pointer transition-opacity hover:opacity-75 ${
                activePath === item.path ? "opacity-100" : "opacity-80"
              }`}
            >
              <img src={item.image} alt={item.label} className="w-7 h-7" />
            </Link>
          ))}
        </div>

        {/* Settings at bottom */}
        <Link
          to="/settings"
          className="cursor-pointer transition-opacity hover:opacity-75"
        >
          <img src="/Img6.png" alt="Settings" className="w-7 h-7" />
        </Link>
      </div>

      {/* Expanded Sidebar */}
      {!isAdmin && (
        <div className="w-40 bg-[#EBF9FC] flex flex-col gap-4">
          {/* Header */}
          <div
            className="flex items-center justify-center flex-col gap-2 bg-[#90E0EF]"
            style={{
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            }}
          >
            <img src="/bml-logo.png" alt="Manta" className="w-8 mt-4" />
            <span
              className="font-semibold text-lg"
              style={{ color: "#0077B6" }}
            >
              Manta Engage
            </span>
          </div>

          {/* Navigation Items */}
          <div>
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors text-[#0077B6] ${
                  activePath === item.path ? "bg-[#E0F2FE]" : ""
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6  justify-end">
          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-blue-600">
              <Search className="w-5 h-5 cursor-pointer" />
            </Button>
            <Button variant="ghost" className="text-blue-600">
              <Bell className="w-5 h-5 cursor-pointer" />
            </Button>
            <Button variant="ghost" className="text-blue-600">
              <User className="w-5 h-5 cursor-pointer" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold text-[#0077B6] mb-1">{title}</h2>
          <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
