import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

interface ActivityChartProps {
  title: string
  data: ChartDataPoint[]
  dataKey?: string
  strokeColor?: string
  strokeWidth?: number
  showTooltip?: boolean
  className?: string
}

export function ActivityChart({
  title,
  data,
  dataKey = "value",
  strokeColor = "#0077B6",
  strokeWidth = 3,
  showTooltip = true,
  className,
}: ActivityChartProps) {
  return (
    <Card className={`shadow-lg rounded-2xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold" style={{ color: "#0077B6" }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                dot={{ r: 4, fill: strokeColor }}
                activeDot={{ r: 6, fill: strokeColor }}
              />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              {showTooltip && <Tooltip />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
