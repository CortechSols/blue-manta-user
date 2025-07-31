import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout";
import { ChevronRight } from "lucide-react";

const metricsData = [
	{
		label: "Fallbacks",
		value: "46%",
		trend: { value: "↑ 46%", positive: false },
		color: "text-red-500",
	},
	{
		label: "6 Month Trend",
		value: "-15%",
		trend: { value: "↓ -15%", positive: true },
		color: "text-green-500",
	},
	{
		label: "PY Trend",
		value: "11%",
		trend: { value: "↑ 11%", positive: false },
		color: "text-red-500",
	},
];

const fallbackLogs = [
	{
		name: "chatbot-blue-manta",
		type: "Created on Jun 1",
		timestamp: "3 mins ago",
	},
	{
		name: "chatbot-landscaping",
		type: "Created on May 29",
		timestamp: "6 days ago",
	},
	{
		name: "chatbot-cleaning",
		type: "Created on May 27",
		timestamp: "8 days ago",
	},
	{
		name: "scraper",
		type: "Created on May 11",
		timestamp: "22 days ago",
	},
	{
		name: "scraper-schedule",
		type: "Created on May 8",
		timestamp: "25 days ago",
	},
];

export default function QualityAssurancePage() {
	return (
		<DashboardLayout
			title="SparkleBlue Pool Services"
			subtitle="Prompt Fallback Logs"
			activePath="/qa"
		>
			{/* Metrics Section */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-lg font-semibold text-[#0077B6]">
						Metrics
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{metricsData.map((metric, index) => (
							<div key={index} className="space-y-1">
								<div className="text-sm text-gray-600">{metric.label}</div>
								<div className="flex items-center gap-2">
									<span className="text-2xl font-bold text-gray-900">
										{metric.value}
									</span>
									<span
										className={`text-sm px-2 py-1 rounded-full bg-gray-100 ${metric.color}`}
									>
										{metric.trend.value}
									</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Fallback Logs Section */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-semibold text-[#0077B6]">
						Fallback Logs
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="border-2 border-[#0077B6] rounded-lg overflow-hidden">
						{/* Table Header */}
						<div className="grid grid-cols-3 bg-gray-50 border-b border-[#0077B6]">
							<div className="p-4 font-semibold text-gray-700">
								Fallback Logs
							</div>
							<div className="p-4 font-semibold text-gray-700">Type</div>
							<div className="p-4 font-semibold text-gray-700">Time Stamp</div>
						</div>

						{/* Table Rows */}
						{fallbackLogs.map((log, index) => (
							<div
								key={index}
								className="grid grid-cols-3 items-center hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
							>
								<div className="p-4 text-gray-900">{log.name}</div>
								<div className="p-4 text-gray-600">{log.type}</div>
								<div className="p-4 flex items-center justify-between">
									<span className="text-gray-600">{log.timestamp}</span>
									<ChevronRight className="w-5 h-5 text-[#0077B6]" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Action Buttons */}
			<div className="flex gap-4 mt-6">
				<Button className="bg-[#0077B6] hover:bg-[#005A8A] text-white">
					Re-sync Config
				</Button>
				<Button className="bg-[#0077B6] hover:bg-[#005A8A] text-white">
					Send Test
				</Button>
				<Button className="bg-[#0077B6] hover:bg-[#005A8A] text-white">
					Clear Fallback Log
				</Button>
			</div>
		</DashboardLayout>
	);
}
