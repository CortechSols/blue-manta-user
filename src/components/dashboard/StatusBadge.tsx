import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  value: string
  positive?: boolean
  size?: "sm" | "md"
  className?: string
}

export function StatusBadge({ value, positive = true, size = "md", className }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
  }

  return (
    <div
      className={cn(
        "text-green-600 bg-green-100 rounded-full inline-block",
        sizeClasses[size],
        !positive && "text-red-600 bg-red-100",
        className,
      )}
    >
      {value}
    </div>
  )
}
