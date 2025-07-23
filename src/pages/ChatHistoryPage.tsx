import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Clock,
  User,
  Eye,
} from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useConversations, useChatbotRefresh } from "@/hooks/useChatbotApi";
import { format } from "date-fns";

const avatarColors = [
  "bg-blue-200 text-blue-700",
  "bg-green-200 text-green-700",
  "bg-purple-200 text-purple-700",
  "bg-teal-200 text-teal-700",
  "bg-indigo-200 text-indigo-700",
  "bg-pink-200 text-pink-700",
  "bg-yellow-200 text-yellow-700",
];

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

const toLinear = (c: number) =>
  c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

function getLuminance(r: number, g: number, b: number) {
  const [R, G, B] = [r, g, b].map((v) => toLinear(v / 255));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function pickTextColor(bgHex: string) {
  const rgb = bgHex.match(/\w\w/g)?.map((h) => parseInt(h, 16));
  const L = getLuminance(rgb?.[0] || 0, rgb?.[1] || 0, rgb?.[2] || 0);
  return L > 0.179 ? "#000000" : "#ffffff";
}

export default function ChatHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const navigate = useNavigate();

  // API hooks
  const {
    data: conversationsData,
    isLoading,
    error,
    refetch,
  } = useConversations({
    page: currentPage,
    page_size: pageSize,
  });

  const { refreshConversations } = useChatbotRefresh();

  const handleRefresh = () => {
    refreshConversations({ page: currentPage, page_size: pageSize });
    refetch();
  };

  // Filter conversations based on search query
  const filteredConversations =
    conversationsData?.conversations?.filter(
      (conversation) =>
        conversation.visitorName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conversation.visitorEmail
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conversation.chatbotName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conversation.lastMessage?.content
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  if (error) {
    const isBackendNotAvailable = error.message?.includes(
      "not available on the backend"
    );

    return (
      <DashboardLayout
        title="Chat History"
        subtitle="View and manage conversation history"
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
                    ? "Chat History Feature Not Available"
                    : "Error Loading Chat History"}
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
            {!isBackendNotAvailable && (
              <RefreshButton
                onRefresh={handleRefresh}
                label="Try Again"
                className="mt-4 border-red-300 text-red-700 hover:bg-red-100 w-full sm:w-auto"
              />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Chat History"
      subtitle="View and manage conversation history"
      activePath="/chat-history"
    >
      <div className="space-y-6 px-4 sm:px-0">
        {/* Header with Search and Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Chat History
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {conversationsData?.totalCount || 0} total conversations
            </p>
          </div>
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search conversations by visitor name, email, chatbot, or message content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-4 border-gray-300 rounded-lg"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading conversations...</span>
          </div>
        ) : filteredConversations.length > 0 ? (
          <>
            {/* Chat History List */}
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {filteredConversations.map((conversation, index) => {
                return (
                  <div
                    key={conversation.id}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/conversation/${conversation.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left side - Avatar and content */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                            avatarColors[index % avatarColors.length]
                          }`}
                        >
                          {conversation.visitorName?.[0]?.toUpperCase() || (
                            <User className="w-5 h-5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {conversation.visitorName || "Anonymous User"}
                            </h4>
                            <Badge variant="outline" className="text-xs w-fit">
                              {conversation.chatbotName}
                            </Badge>
                          </div>

                          {conversation.visitorEmail && (
                            <p className="text-xs text-gray-500 mb-2 truncate">
                              {conversation.visitorEmail}
                            </p>
                          )}

                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {conversation.lastMessage?.content ||
                              "No messages yet"}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {conversation.messageCount} message
                              {conversation.messageCount !== 1 ? "s" : ""}
                            </span>
                            {conversation.startedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Started{" "}
                                {safeFormatDate(
                                  conversation.startedAt,
                                  "MMM d, yyyy"
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side - Time, status, and view button */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0 sm:items-end">
                        <div className="text-right">
                          {conversation.lastMessage?.sentAt && (
                            <>
                              <div className="text-sm text-gray-500">
                                {getTimeAgo(conversation.lastMessage.sentAt)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {safeFormatDate(
                                  conversation.lastMessage.sentAt,
                                  "MMM d, yyyy"
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium`}
                            style={{
                              backgroundColor: conversation.statusColor || "",
                              color: pickTextColor(
                                conversation.statusColor || ""
                              ),
                            }}
                          >
                            {conversation.statusDisplay || ""}
                          </Badge>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Info */}
            {conversationsData && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
                <div>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(
                    currentPage * pageSize,
                    conversationsData.totalCount
                  )}{" "}
                  of {conversationsData.totalCount} conversations
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    Page {conversationsData.page} of{" "}
                    {conversationsData.totalPages}
                  </span>
                  {conversationsData.totalPages > 1 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= conversationsData.totalPages}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(conversationsData.totalPages, prev + 1)
                          )
                        }
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 sm:p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                {searchQuery
                  ? `No conversations match your search for "${searchQuery}". Try different keywords or clear the search.`
                  : "When visitors start chatting with your chatbots, their conversations will appear here."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="w-full sm:w-auto"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
