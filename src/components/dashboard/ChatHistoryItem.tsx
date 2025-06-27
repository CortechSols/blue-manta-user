interface ChatHistoryItemProps {
  user: {
    name: string
    initials: string
    avatar?: string
  }
  message: string
  timestamp: string
  status?: "online" | "offline"
  className?: string
}

export function ChatHistoryItem({ user, message, timestamp, className }: ChatHistoryItemProps) {
  return (
    <div className={`flex items-start gap-3 p-3 bg-blue-50 rounded-lg ${className}`}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
        style={{ backgroundColor: "#90E0EF" }}
      >
        {user.avatar ? (
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          user.initials
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{user.name}</span>
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">{timestamp}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
    </div>
  )
}
