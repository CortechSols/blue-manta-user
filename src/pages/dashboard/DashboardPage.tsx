"use client";

import {
  DashboardContainer,
  MetricCard,
  ChatHistoryCard,
} from "@/components/dashboard";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/loading-states";
import { useDashboardData } from "@/hooks/useChatbotApi";
import { useAuthStore } from "@/stores/authStore";
import { formatTimestamp, getInitials } from "@/lib/formatUtils";

export default function DashboardPage() {
  const { data: dashboardData, isLoading, error } = useDashboardData();
  const { user } = useAuthStore();

  const dashboardTitle = `${user?.organizationName}`;
  const dashboardSubtitle = "Chatbot Analytics & Performance";

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout
        title={dashboardTitle}
        subtitle={dashboardSubtitle}
        activePath="/dashboard"
      >
        <DashboardContainer title={dashboardTitle} subtitle={dashboardSubtitle}>
          <LoadingState message="Loading dashboard data..." />
        </DashboardContainer>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout
        title={dashboardTitle}
        subtitle={dashboardSubtitle}
        activePath="/dashboard"
      >
        <DashboardContainer title={dashboardTitle} subtitle={dashboardSubtitle}>
          <ErrorState error={error} />
        </DashboardContainer>
      </DashboardLayout>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <DashboardLayout
        title={dashboardTitle}
        subtitle={dashboardSubtitle}
        activePath="/dashboard"
      >
        <DashboardContainer title={dashboardTitle} subtitle={dashboardSubtitle}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600">No dashboard data available</p>
            </div>
          </div>
        </DashboardContainer>
      </DashboardLayout>
    );
  }

  // Key metrics for cards
  const keyMetrics = [
    {
      label: "Lead Conversion Rate",
      value: `${dashboardData.leadConversionRate}%`,
      trend: { value: "Excellent", positive: true },
      color: "#0077B6",
    },
    {
      label: "Avg Chat Duration",
      value: `${dashboardData.averageChatDuration} sec`,
      trend: { value: "Optimal", positive: true },
      color: "#0077B6",
    },
  ];

  // Transform recent chats for ChatHistoryCard
  const recentChats = dashboardData.recentChatsSummary.map((chat) => ({
    id: chat.id.toString(),
    user: {
      name: chat.visitorName || `Visitor ${chat.visitorId.slice(0, 8)}`,
      initials: getInitials(chat.visitorName || "U"),
    },
    message: chat?.lastMessage?.content || "No message",
    timestamp: formatTimestamp(chat.startedAt),
    status: chat.status as "online" | "offline",
  }));

  return (
    <DashboardLayout
      title={dashboardTitle}
      subtitle={dashboardSubtitle}
      activePath="/dashboard"
    >
      <DashboardContainer
        title="Organization Dashboard"
        subtitle={dashboardSubtitle}
        className="gap-0 space-y-0"
      >
        {/* First Row - Performance Metrics, Total Conversations, Top Performing Chatbots */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-1/2 mb-2">
          {/* Performance Metrics */}
          <div className="w-full h-full">
            <MetricCard title="Performance Metrics" metrics={keyMetrics} />
          </div>

          {/* Total Conversations Section */}
          <div className="w-full h-full">
            <Card className="h-full border border-gray-200 rounded-lg dashboard-shadow">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle
                  className="text-base md:text-lg font-semibold"
                  style={{ color: "#0077B6" }}
                >
                  Overview Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 h-full flex flex-col">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardData.totalConversations}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Conversations
                    </div>
                    <Badge variant="success" className="mt-1">
                      Active
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardData.leadsCaptured}
                    </div>
                    <div className="text-sm text-gray-600">Leads Captured</div>
                    <Badge variant="success" className="mt-1">
                      {dashboardData.leadConversionRate}%
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardData.meetingsBooked}
                    </div>
                    <div className="text-sm text-gray-600">Meetings Booked</div>
                    <Badge variant="info" className="mt-1">
                      Growing
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardData.activeChatbots}
                    </div>
                    <div className="text-sm text-gray-600">Active Chatbots</div>
                    <Badge variant="success" className="mt-1">
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Chatbots */}
          <div className="w-full h-full">
            <Card className="h-full border border-gray-200 rounded-lg dashboard-shadow">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle
                  className="text-base md:text-lg font-semibold"
                  style={{ color: "#0077B6" }}
                >
                  Top Performing Chatbots
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 h-full flex flex-col">
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {dashboardData.topPerformingChatbots.length > 0 ? (
                    dashboardData.topPerformingChatbots.map(
                      (chatbot, index) => (
                        <div
                          key={chatbot.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div
                                className="text-sm font-medium text-gray-900 truncate max-w-[120px]"
                                title={chatbot.name}
                              >
                                {chatbot.name}
                              </div>
                            </div>
                          </div>
                          <Badge variant="info" className="text-xs">
                            {chatbot.messageCount} msgs
                          </Badge>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      No data
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row - System Status and Recent Chats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-1/2">
          {/* System Status */}
          <div className="w-full h-full">
            <Card className="h-full border border-gray-200 rounded-lg dashboard-shadow">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle
                  className="text-base md:text-lg font-semibold"
                  style={{ color: "#0077B6" }}
                >
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 h-full flex flex-col">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Active Chatbots
                      </div>
                      <div className="text-xs text-gray-600">
                        All systems operational
                      </div>
                    </div>
                    <Badge variant="success">
                      {dashboardData.activeChatbots} Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Data Sources
                      </div>
                      <div className="text-xs text-gray-600">
                        Synced and connected
                      </div>
                    </div>
                    <Badge variant="info">
                      {dashboardData.dataSourceCount} Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Meetings Scheduled
                      </div>
                      <div className="text-xs text-gray-600">
                        Pending appointments
                      </div>
                    </div>
                    <Badge variant="warning">
                      {dashboardData.meetingsBooked} Pending
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        System Health
                      </div>
                      <div className="text-xs text-gray-600">
                        All services running
                      </div>
                    </div>
                    <Badge variant="success">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Chats */}
          <div className="w-full h-full">
            <ChatHistoryCard
              title="Recent Chat Sessions"
              messages={recentChats}
            />
          </div>
        </div>
      </DashboardContainer>
    </DashboardLayout>
  );
}
