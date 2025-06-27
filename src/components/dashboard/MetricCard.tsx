import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"

interface MetricCardProps {
  title: string
  metrics: Array<{
    label: string
    value: string | number
    trend?: {
      value: string
      positive?: boolean
    }
    color?: string
  }>
  className?: string
}

export function MetricCard({ title, metrics, className }: MetricCardProps) {
  return (
    <Card className={`shadow-lg rounded-2xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold" style={{ color: "#0077B6" }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
            <div className="text-3xl font-bold mb-2" style={{ color: metric.color || "#1f2937" }}>
              {metric.value}
            </div>
            {metric.trend && <StatusBadge value={metric.trend.value} positive={metric.trend.positive} />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
