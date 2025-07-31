interface ChatHistoryItemProps {
  user: {
    name: string;
    initials: string;
    avatar?: string;
  };
  message: string;
  timestamp: string;
  status?: "online" | "offline";
  className?: string;
}

export function ChatHistoryItem({
  user,
  message,
  timestamp,
  className,
}: ChatHistoryItemProps) {
  return (
    <div
      className={`flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-blue-50 rounded-lg ${className}`}
    >
      <div
        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-medium text-sm md:text-base flex-shrink-0"
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
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-gray-900 text-sm md:text-base truncate">
            {user.name}
          </span>
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
            {timestamp}
          </span>
        </div>
        <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
          {message}
        </p>
      </div>
    </div>
  );
}
