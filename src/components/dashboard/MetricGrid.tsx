import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";

interface MetricGridProps {
  metrics: Array<{
    label: string;
    value: string | number;
    trend?: {
      value: string;
      positive?: boolean;
    };
    color?: string;
  }>;
  columns?: number;
  className?: string;
}

export function MetricGrid({
  metrics,
  columns = 3,
  className,
}: MetricGridProps) {
  // Create responsive grid classes based on the desired columns
  const getResponsiveGridClasses = (cols: number) => {
    switch (cols) {
      case 2:
        return "grid grid-cols-1 sm:grid-cols-2 gap-4";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4";
      case 4:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4";
    }
  };

  return (
    <Card className={`shadow-lg rounded-2xl ${className || ""}`}>
      <CardContent className="p-4 md:p-6">
        <div className={`${getResponsiveGridClasses(columns)} text-center`}>
          {metrics.map((metric, index) => (
            <div key={index} className="min-w-0">
              <div className="text-xs md:text-sm text-gray-600 mb-1 text-nowrap lg:truncate">
                {metric.label}
              </div>
              <div
                className="text-lg md:text-2xl font-bold text-nowrap lg:truncate"
                style={{ color: metric.color || "#00B4D8" }}
              >
                {metric.value}
              </div>
              {metric.trend && (
                <div className="mt-1">
                  <StatusBadge
                    value={metric.trend.value}
                    positive={metric.trend.positive}
                    size="sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
