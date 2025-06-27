import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  description?: string
  trend?: {
    value: string
    positive?: boolean
  }
  className?: string
  valueClassName?: string
}

export function MetricCard({ title, value, description, trend, className, valueClassName }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
          {trend && (
            <div className={cn("text-xs font-medium", trend.positive ? "text-green-500" : "text-red-500")}>
              {trend.value}
            </div>
          )}
        </div>
        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      </CardContent>
    </Card>
  )
}
