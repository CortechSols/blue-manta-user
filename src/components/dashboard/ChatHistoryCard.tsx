"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatHistoryItem } from "./ChatHistoryItem";

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
}

interface ChatHistoryCardProps {
  title: string;
  messages: ChatMessage[];
  onSeeMore?: () => void;
  className?: string;
}

export function ChatHistoryCard({
  title,
  messages,
  onSeeMore,
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
          {messages.map((message) => (
            <ChatHistoryItem key={message.id} {...message} />
          ))}
        </div>
        {onSeeMore && (
          <div className="text-center mt-4">
            <Button
              variant="link"
              className="text-gray-500"
              onClick={onSeeMore}
            >
              See More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
