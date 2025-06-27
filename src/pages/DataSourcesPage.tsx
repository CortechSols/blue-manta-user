import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Search } from "lucide-react";

const dataFiles = [
	{
		name: "Comfort Air FAQ",
		status: "Uploading...",
		statusColor: "text-blue-600",
		lastTrained: "3 mins ago",
	},
	{
		name: "Hours of Operation",
		status: "Uploaded",
		statusColor: "text-gray-600",
		lastTrained: "3 mins ago",
	},
	{
		name: "Pool Cleaning Best Practices",
		status: "Uploaded",
		statusColor: "text-gray-600",
		lastTrained: "3 mins ago",
	},
	{
		name: "Product Descriptions",
		status: "Uploaded",
		statusColor: "text-gray-600",
		lastTrained: "3 mins ago",
	},
	{
		name: "Services & Pricing",
		status: "Uploaded",
		statusColor: "text-gray-600",
		lastTrained: "3 mins ago",
	},
	{
		name: "Pool Cleaning Handbook",
		status: "Uploaded",
		statusColor: "text-gray-600",
		lastTrained: "3 mins ago",
	},
];

export default function DataSourcesPage() {
	return (
		<DashboardLayout
			title="SparkleBlue Pool Services"
			subtitle="Data Sources"
			activePath="/data"
		>
			<div className="space-y-6">
				{/* Top Controls */}
				<div className="flex items-center justify-between">
					<Button className="bg-[#0077B6] hover:bg-[#005A8A] text-white px-6">
						Choose File
					</Button>
					<div className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
						<Search className="w-5 h-5 text-gray-500" />
					</div>
				</div>

				{/* Data Table */}
				<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
					{/* Table Header */}
					<div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
						<div className="p-4 text-sm font-medium text-gray-700">
							File Name
						</div>
						<div className="p-4 text-sm font-medium text-gray-700">Status</div>
						<div className="p-4 text-sm font-medium text-gray-700">
							Last Trained
						</div>
					</div>

					{/* Table Rows */}
					{dataFiles.map((file, index) => (
						<div
							key={index}
							className="grid grid-cols-3 items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
						>
							<div className="p-4">
								<span
									className={`text-sm ${
										file.name === "Comfort Air FAQ"
											? "text-[#0077B6]"
											: "text-gray-700"
									}`}
								>
									{file.name}
								</span>
							</div>
							<div className="p-4">
								<span className={`text-sm ${file.statusColor}`}>
									{file.status}
								</span>
							</div>
							<div className="p-4">
								<span className="text-sm text-gray-500">
									{file.lastTrained}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</DashboardLayout>
	);
}
