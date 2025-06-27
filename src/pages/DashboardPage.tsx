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
				{/* Top Row - 3 Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					{/* Business Metrics Card */}
					<MetricCard title="Business Metrics" metrics={businessMetrics} />

					{/* Middle Metrics Grid */}
					<MetricGrid metrics={gridMetrics} columns={3} />

					{/* Right Column - Two Cards */}
					<div className="space-y-6">
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

				{/* Bottom Row - 2 Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<ChatHistoryCard
						title="Chat History"
						messages={chatMessages}
						onSeeMore={() => console.log("See more clicked")}
					/>

					<ActivityChart
						title="Chatbot Activity Volume"
						data={chartData}
						strokeColor="#0077B6"
						strokeWidth={3}
					/>
				</div>
			</DashboardContainer>
		</DashboardLayout>
	);
}
