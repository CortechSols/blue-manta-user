import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopicsListProps {
  title: string
  topics: string[]
  className?: string
}

export function TopicsList({ title, topics, className }: TopicsListProps) {
  return (
    <Card className={`shadow-lg rounded-2xl ${className}`}>
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-base md:text-lg font-semibold" style={{ color: "#0077B6" }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-2 md:space-y-3">
          {topics.map((topic, index) => (
            <div key={index} className="text-xs md:text-sm text-gray-700 px-2 py-1 bg-gray-50 rounded">
              {topic}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
