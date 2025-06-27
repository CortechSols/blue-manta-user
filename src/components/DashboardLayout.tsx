import { useState } from "react";
import type { ReactNode } from "react";
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
  Search,
  Bell,
  User,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import {
  useOrganizations,
  getOrganizationFullName,
} from "@/hooks/useOrganizations";

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "App Calendar", path: "/calendar" },
  { icon: FileText, label: "Content Generator", path: "/content" },
  { icon: Database, label: "Data Sources", path: "/data" },
  { icon: Users, label: "Train Chatbot !!!", path: "/train-chatbot" },
  { icon: History, label: "Chat History", path: "/chat-history" },
  { icon: UserCircle, label: "Client Profile", path: "/client-profile" },
  { icon: ShieldCheck, label: "Quality Assurance", path: "/qa" },
];

// Old customers array - commented out
/*
const customers = [
	"All Clients",
	"ABC HVAC Supplies",
	"All Around Wellness",
	"Baby Blue Pool Cleaning",
	"Contractor Supply, Inc.",
	"Fallen Heros Landscaping",
	"Graven Contractor Depo",
	"Maple Leaf Landscaping",
	"Neptune Pool & Spas",
	"Sparkle Blue Pool Services",
	"Telon Bay CPA Services",
	"Welton's Heating & Cooling",
	"Zambia Health and Design",
];
*/

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
  // Fetch organizations data
  const { data: organizations, isLoading, error } = useOrganizations();
  const [selectedCustomer, setSelectedCustomer] =
    useState<string>("All Clients");

  const location = useLocation();
  const pathname = location.pathname;
  const isAdmin = pathname.includes("/settings");

  // Handle delete organization (placeholder for future implementation)
  const handleDeleteOrganization = (
    organizationId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    // TODO: Implement delete functionality
  };

  return (
    <div className="min-h-screen bg-gray-50 flex max-h-screen ">
      {/* Icon Sidebar */}
      <div className="w-20 flex flex-col items-center py-6 bg-[#CAF0F8] max-h-screen overflow-y-auto ">
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
                activePath === item.path ? "bg-[#CAF0F8]" : ""
              }`}
            >
              <item.icon className="w-6 h-6" />
            </Link>
          ))}
        </div>

        {/* Settings at bottom */}
        <Link
          to="/settings"
          className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer text-[#0077B6] hover:bg-white/20"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </div>

      {/* Expanded Sidebar */}
      {!isAdmin && (
        <div className="w-40 bg-[#EBF9FC] flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-center flex-col gap-2">
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
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Customer Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2"
                style={{
                  backgroundColor: "#CAF0F8",
                  borderColor: "#0077B6",
                  color: "#0077B6",
                }}
              >
                {isLoading ? "Loading..." : selectedCustomer}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {/* All Clients option */}
              <DropdownMenuItem
                onClick={() => setSelectedCustomer("All Clients")}
                className="text-blue-600"
              >
                All Clients
              </DropdownMenuItem>

              {/* Organizations from API */}
              {organizations?.map((organization) => (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() =>
                    setSelectedCustomer(getOrganizationFullName(organization))
                  }
                  className="text-blue-600 flex items-center justify-between group"
                >
                  <span>{getOrganizationFullName(organization)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-4 w-4 p-0 hover:bg-red-100"
                    onClick={(e) =>
                      handleDeleteOrganization(organization.id, e)
                    }
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </Button>
                </DropdownMenuItem>
              ))}

              {/* Loading state */}
              {isLoading && (
                <DropdownMenuItem disabled className="text-gray-400">
                  Loading organizations...
                </DropdownMenuItem>
              )}

              {/* Error state */}
              {error && (
                <DropdownMenuItem disabled className="text-red-400">
                  Error loading organizations
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-blue-600">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-600">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-600">
              <User className="w-5 h-5" />
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
