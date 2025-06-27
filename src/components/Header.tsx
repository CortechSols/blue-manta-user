import { Search, Bell, User } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Input } from "./ui/input"

interface HeaderProps {
  title: string
  subtitle?: string
  showSearch?: boolean
  showCustomerSelect?: boolean
  customerName?: string
}

export function Header({
  title,
  subtitle,
  showSearch = true,
  showCustomerSelect = true,
  customerName = "Customer List",
}: HeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-4">
        {showCustomerSelect && (
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 text-blue-600">
                  {customerName}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px]">
                <DropdownMenuLabel>Select Customer</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>SparkleBlue Pool Services</DropdownMenuItem>
                <DropdownMenuItem>ABC HVAC Supplies</DropdownMenuItem>
                <DropdownMenuItem>All Account Plumbers</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div>
          <h1 className="text-lg font-medium text-blue-600">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="search" placeholder="Search..." className="w-[200px] pl-8" />
          </div>
        )}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
