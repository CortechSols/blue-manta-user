import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";

interface MetricCardProps {
  title: string;
  metrics: Array<{
    label: string;
    value: string | number;
    trend?: {
      value: string;
      positive?: boolean;
    };
    color?: string;
  }>;
  className?: string;
}

export function MetricCard({ title, metrics, className }: MetricCardProps) {
  console.log("MetricCard", metrics);
  return (
    <Card
      className={`h-full border border-gray-200 rounded-lg dashboard-shadow ${className}`}
    >
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle
          className="text-base md:text-lg font-semibold"
          style={{ color: "#0077B6" }}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 h-full flex flex-col justify-center">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className="text-xs md:text-sm text-gray-600 mb-1">
              {metric.label}
            </div>
            <div
              className="text-xl md:text-3xl font-bold mb-2"
              style={{ color: metric.color || "#1f2937" }}
            >
              {metric.value}
            </div>
            {metric.trend && (
              <StatusBadge
                value={metric.trend.value}
                positive={metric.trend.positive}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
