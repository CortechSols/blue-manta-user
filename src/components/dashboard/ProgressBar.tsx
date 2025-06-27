import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Legend } from "./Legend"

interface ProgressBarProps {
  title: string
  subtitle?: string
  progress: number
  gradient?: {
    colors: string[]
    stops?: number[]
  }
  legend?: Array<{
    color: string
    label: string
  }>
  className?: string
}

export function ProgressBar({
  title,
  subtitle,
  progress,
  gradient = {
    colors: ["#0077B6", "#00B4D8", "#90E0EF"],
  },
  legend,
  className,
}: ProgressBarProps) {
  const gradientStyle =
    gradient.colors.length > 1 ? `linear-gradient(to right, ${gradient.colors.join(", ")})` : gradient.colors[0]

  return (
    <Card className={`shadow-lg rounded-2xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold" style={{ color: "#0077B6" }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subtitle && <div className="text-sm text-gray-500 mb-3">{subtitle}</div>}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="h-4 rounded-full"
            style={{
              background: gradientStyle,
              width: `${progress}%`,
            }}
          />
        </div>
        {legend && <Legend items={legend} />}
      </CardContent>
    </Card>
  )
}
