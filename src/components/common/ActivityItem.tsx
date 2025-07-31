import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
  user: {
    name: string
    avatar?: string
    initials: string
  }
  message: string
  timestamp: string
  status?: "success" | "pending" | "error"
  className?: string
}

export function ActivityItem({ user, message, timestamp, status = "success", className }: ActivityItemProps) {
  const statusColors = {
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  }

  return (
    <div className={cn("flex items-start gap-3 py-3", className)}>
      <Avatar className="h-8 w-8">
        {user.avatar && <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />}
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{user.name}</p>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <p className="text-xs text-gray-500">{message}</p>
      </div>
      <div className={cn("rounded-full px-2 py-0.5 text-xs", statusColors[status])}>
        {status === "success" && "Completed"}
        {status === "pending" && "In Progress"}
        {status === "error" && "Failed"}
      </div>
    </div>
  )
}
