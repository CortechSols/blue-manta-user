"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatHistoryItem } from "@/components/dashboard";

interface ChatMessage {
  id: string;
  user: {
    name: string;
    initials: string;
    avatar?: string;
  };
  message: string;
  timestamp: string;
  status?: "online" | "offline";
  visitorId?: string;
}

interface ChatHistoryCardProps {
  title: string;
  messages: ChatMessage[];
  className?: string;
}

export function ChatHistoryCard({
  title,
  messages,
  className,
}: ChatHistoryCardProps) {
  return (
    <Card
      className={`h-full border border-gray-200 rounded-lg dashboard-shadow ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle
          className="text-lg font-semibold"
          style={{ color: "#0077B6" }}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col">
        <div className="space-y-4 flex-1 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((message) => (
              <ChatHistoryItem key={message.id} {...message} />
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">No data</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
