import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"

interface MetricGridProps {
  metrics: Array<{
    label: string
    value: string | number
    trend?: {
      value: string
      positive?: boolean
    }
    color?: string
  }>
  columns?: number
  className?: string
}

export function MetricGrid({ metrics, columns = 3, className }: MetricGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }

  return (
    <Card className={`shadow-lg rounded-2xl ${className}`}>
      <CardContent className="p-6">
        <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4 text-center`}>
          {metrics.map((metric, index) => (
            <div key={index}>
              <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
              <div className="text-2xl font-bold" style={{ color: metric.color || "#00B4D8" }}>
                {metric.value}
              </div>
              {metric.trend && (
                <div className="mt-1">
                  <StatusBadge value={metric.trend.value} positive={metric.trend.positive} size="sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
