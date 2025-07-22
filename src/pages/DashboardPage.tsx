"use client";

import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { TopicsList } from "@/components/dashboard/TopicsList";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { ChatHistoryCard } from "@/components/dashboard/ChatHistoryCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { DashboardLayout } from "@/components/DashboardLayout";

const chartData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 280 },
  { name: "May", value: 590 },
  { name: "Jun", value: 320 },
  { name: "Jul", value: 350 },
];

// Data for reusable components
const businessMetrics = [
  {
    label: "Costs Savings",
    value: "$45k",
    trend: { value: "+ 42%", positive: true },
    color: "#1f2937",
  },
  {
    label: "Cost per Lead",
    value: "$23",
    trend: { value: "+ 42%", positive: true },
    color: "#1f2937",
  },
];

const gridMetrics = [
  {
    label: "# of Leads YTD",
    value: "345",
    trend: { value: "+ 42%", positive: true },
  },
  {
    label: "# of Users YTD",
    value: "658",
    trend: { value: "+ 42%", positive: true },
  },
  {
    label: "Avg Conversation",
    value: "1.43 min",
    trend: { value: "+ 42%", positive: true },
  },
  {
    label: "User Rating",
    value: "4.5 stars",
    trend: { value: "+ 42%", positive: true },
  },
  {
    label: "Bounce Rate",
    value: "3.50%",
    trend: { value: "+ 42%", positive: true },
  },
  {
    label: "Retention Rate",
    value: "57.32%",
    trend: { value: "+ 42%", positive: true },
  },
];

const engagementTopics = [
  "Pool cleaning",
  "Set up a consultation",
  "Hours of operations",
];

const chatMessages = [
  {
    id: "1",
    user: { name: "John Smith", initials: "J" },
    message: "Hello, I need a pool cleaner...",
    timestamp: "32m",
  },
  {
    id: "2",
    user: { name: "John Smith", initials: "J" },
    message: "Hello, I need a pool cleaner...",
    timestamp: "32m",
  },
  {
    id: "3",
    user: { name: "John Smith", initials: "J" },
    message: "Hello, I need a pool cleaner...",
    timestamp: "32m",
  },
];

const conversationLegend = [
  { color: "#0077B6", label: "Yearly" },
  { color: "#00B4D8", label: "Monthly" },
  { color: "#d1d5db", label: "Weekly" },
];

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="SparkleBlue Pool Services"
      subtitle="Dashboard"
      activePath="/dashboard"
    >
      <DashboardContainer
        title="SparkleBlue Pool Services"
        subtitle="Dashboard"
      >
        {/* Top Row - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Business Metrics Card */}
          <div className="w-full">
            <MetricCard title="Business Metrics" metrics={businessMetrics} />
          </div>

          {/* Middle Metrics Grid */}
          <div className="w-full lg:col-span-1">
            <MetricGrid metrics={gridMetrics} columns={3} />
          </div>

          {/* Right Column - Two Cards */}
          <div className="w-full space-y-4 md:space-y-6">
            <TopicsList
              title="Top Engagement Topics"
              topics={engagementTopics}
            />

            <ProgressBar
              title="Conversations Limit"
              subtitle="Conversations in last 24 hours"
              progress={75}
              gradient={{
                colors: ["#0077B6", "#00B4D8", "#90E0EF"],
              }}
              legend={conversationLegend}
            />
          </div>
        </div>

        {/* Bottom Row - Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <div className="w-full">
            <ChatHistoryCard
              title="Chat History"
              messages={chatMessages}
              onSeeMore={() => console.log("See more clicked")}
            />
          </div>

          <div className="w-full">
            <ActivityChart
              title="Chatbot Activity Volume"
              data={chartData}
              strokeColor="#0077B6"
              strokeWidth={3}
            />
          </div>
        </div>
      </DashboardContainer>
    </DashboardLayout>
  );
}
