import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  User,
  Bot,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  useConversationMessages,
  useChatbotRefresh,
} from "@/hooks/useChatbotApi";
import { format } from "date-fns";

// Helper function to safely format dates
const safeFormatDate = (dateString: string, formatString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, formatString);
  } catch {
    return "Invalid date";
  }
};

// Helper function to get time ago
const getTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} min${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30)
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  } catch {
    return "Unknown time";
  }
};

export default function ConversationDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(false);

  // API hooks
  const {
    data: messages,
    isLoading,
    error,
    refetch,
  } = useConversationMessages(conversationId ? parseInt(conversationId) : 0);
  const { refreshConversation } = useChatbotRefresh();

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh || !conversationId) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, conversationId, refetch]);

  const handleRefresh = () => {
    if (conversationId) {
      refreshConversation(parseInt(conversationId));
      refetch();
    }
  };

  const handleBackToHistory = () => {
    navigate("/chat-history");
  };

  if (!conversationId) {
    return (
      <DashboardLayout
        title="Conversation Detail"
        subtitle="View conversation messages"
        activePath="/chat-history"
      >
        <Card className="border-red-200 bg-red-50 mx-4 sm:mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="space-y-1">
                <h3 className="font-semibold text-red-800">
                  Invalid Conversation
                </h3>
                <p className="text-sm text-red-600">
                  No conversation ID provided. Please go back to chat history.
                </p>
              </div>
            </div>
            <Button
              onClick={handleBackToHistory}
              variant="outline"
              className="mt-4 border-red-300 text-red-700 hover:bg-red-100 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat History
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (error) {
    const isBackendNotAvailable = error.message?.includes(
      "not available on the backend"
    );

    return (
      <DashboardLayout
        title="Conversation Detail"
        subtitle="View conversation messages"
        activePath="/chat-history"
      >
        <Card
          className={`${
            isBackendNotAvailable
              ? "border-orange-200 bg-orange-50"
              : "border-red-200 bg-red-50"
          } mx-4 sm:mx-0`}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertCircle
                className={`h-5 w-5 flex-shrink-0 ${
                  isBackendNotAvailable ? "text-orange-600" : "text-red-600"
                }`}
              />
              <div className="space-y-1">
                <h3
                  className={`font-semibold ${
                    isBackendNotAvailable ? "text-orange-800" : "text-red-800"
                  }`}
                >
                  {isBackendNotAvailable
                    ? "Conversation Messages Feature Not Available"
                    : "Error Loading Messages"}
                </h3>
                <p
                  className={`text-sm ${
                    isBackendNotAvailable ? "text-orange-600" : "text-red-600"
                  }`}
                >
                  {error.message}
                </p>
                {isBackendNotAvailable && (
                  <p className="text-orange-500 text-sm mt-2">
                    This feature is currently being developed. Please check back
                    later or contact your administrator.
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                onClick={handleBackToHistory}
                variant="outline"
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat History
              </Button>
              {!isBackendNotAvailable && (
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className={`w-full sm:w-auto ${
                    isBackendNotAvailable
                      ? "border-orange-300 text-orange-700 hover:bg-orange-100"
                      : "border-red-300 text-red-700 hover:bg-red-100"
                  }`}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Conversation Detail"
      subtitle="View conversation messages"
      activePath="/chat-history"
    >
      <div className="space-y-6 px-4 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleBackToHistory}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Conversation #{conversationId}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              {messages?.length || 0} message{messages?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Auto-refresh:</label>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                className="w-full sm:w-auto"
              >
                {autoRefresh ? "On" : "Off"}
              </Button>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading messages...</span>
          </div>
        ) : messages && messages.length > 0 ? (
          /* Messages List */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversation Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === "visitor"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {/* Avatar for bot messages */}
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === "visitor"
                          ? "bg-blue-600 text-white ml-auto"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant={
                              message.sender === "visitor"
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-xs ${
                              message.sender === "visitor"
                                ? "bg-blue-500 text-white border-blue-400"
                                : "bg-white text-gray-600"
                            }`}
                          >
                            {message.sender === "visitor" ? "Visitor" : "Bot"}
                          </Badge>
                          <span
                            className={`text-xs ${
                              message.sender === "visitor"
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            {safeFormatDate(message.sentAt, "HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div
                          className={`text-xs ${
                            message.sender === "visitor"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {getTimeAgo(message.sentAt)} •{" "}
                          {safeFormatDate(message.sentAt, "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>

                    {/* Avatar for visitor messages */}
                    {message.sender === "visitor" && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Empty State */
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 sm:p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No messages found
              </h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                This conversation doesn't have any messages yet, or they
                couldn't be loaded.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={handleBackToHistory}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Chat History
                </Button>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
