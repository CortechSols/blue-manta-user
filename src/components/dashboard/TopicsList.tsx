import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopicsListProps {
  title: string
  topics: string[]
  className?: string
}

export function TopicsList({ title, topics, className }: TopicsListProps) {
  return (
    <Card className={`shadow-lg rounded-2xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold" style={{ color: "#0077B6" }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topics.map((topic, index) => (
            <div key={index} className="text-sm text-gray-700">
              {topic}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
