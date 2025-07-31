import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/index";
import { cn } from "@/lib/utils";

interface MetricItem {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive?: boolean;
  };
  color?: string;
}

interface MetricCardProps {
  title: string;
  metrics: MetricItem[];
  className?: string;
  variant?: 'default' | 'compact';
}

export function MetricCard({ 
  title, 
  metrics, 
  className,
  variant = 'default'
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "h-full border border-gray-200 rounded-lg dashboard-shadow",
        className
      )}
    >
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle
          className="text-base md:text-lg font-semibold"
          style={{ color: "#0077B6" }}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(
        "p-4 md:p-6 h-full flex flex-col justify-center",
        variant === 'compact' ? "space-y-2" : "space-y-4 md:space-y-6"
      )}>
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className={cn(
              "text-gray-600 mb-1",
              variant === 'compact' ? "text-xs" : "text-xs md:text-sm"
            )}>
              {metric.label}
            </div>
            <div
              className={cn(
                "font-bold mb-2",
                variant === 'compact' ? "text-lg md:text-xl" : "text-xl md:text-3xl"
              )}
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
