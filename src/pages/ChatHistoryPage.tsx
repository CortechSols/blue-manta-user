import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const chatHistoryData = [
	{
		user: { name: "John Smith", initials: "J" },
		message:
			"Hello, I need a pool cleaner and a hot tub technician for my house.",
		timestamp: "45 mins ago",
		date: "07/11/2025",
		status: "Appointment Request",
		statusColor: "bg-green-100 text-green-700",
	},
	{
		user: { name: "Alicia Yang", initials: "A" },
		message: "How much for pool cleaning?",
		timestamp: "2 hours ago",
		date: "07/11/2025",
		status: "Pricing",
		statusColor: "bg-orange-100 text-orange-700",
	},
	{
		user: { name: "Muhammad Abdul", initials: "M" },
		message: "Can I speak to a pool tech? I can't get my hot tub to heat.",
		timestamp: "15 hours ago",
		date: "07/11/2025",
		status: "Appointment Request",
		statusColor: "bg-green-100 text-green-700",
	},
	{
		user: { name: "Marvin Johnson", initials: "M" },
		message: "Do you have certifications to work on commercial properties?",
		timestamp: "2 days ago",
		date: "07/11/2025",
		status: "FAQ",
		statusColor: "bg-purple-100 text-purple-700",
	},
	{
		user: { name: "Bryson Lee", initials: "B" },
		message:
			"Can I set up an appointment for a cleaner to come to my house next Saturday?",
		timestamp: "6 days ago",
		date: "07/11/2025",
		status: "Appointment Request",
		statusColor: "bg-green-100 text-green-700",
	},
	{
		user: { name: "Jose Sanchez", initials: "J" },
		message: "Can I set up an appointment for a pool cleaning next week?",
		timestamp: "15 days ago",
		date: "07/11/2025",
		status: "Appointment Request",
		statusColor: "bg-green-100 text-green-700",
	},
	{
		user: { name: "James Winslow", initials: "J" },
		message: "I need to speak to someone about last week's pool cleaning...",
		timestamp: "2 months ago",
		date: "07/11/2025",
		status: "Follow Up Needed",
		statusColor: "bg-red-100 text-red-700",
	},
];

const avatarColors = [
	"bg-blue-200 text-blue-700",
	"bg-green-200 text-green-700",
	"bg-purple-200 text-purple-700",
	"bg-teal-200 text-teal-700",
	"bg-indigo-200 text-indigo-700",
	"bg-pink-200 text-pink-700",
	"bg-yellow-200 text-yellow-700",
];

export default function ChatHistoryPage() {
	return (
		<DashboardLayout
			title="SparkleBlue Pool Services"
			subtitle="Chat History"
			activePath="/chat-history"
		>
			<div className="space-y-6">
				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
					<Input
						type="search"
						placeholder=""
						className="h-12 pr-12 border-gray-300 rounded-lg"
					/>
				</div>

				{/* Chat History List */}
				<div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
					{chatHistoryData.map((chat, index) => (
						<div key={index} className="p-4 hover:bg-gray-50 transition-colors">
							<div className="flex items-start justify-between gap-4">
								{/* Left side - Avatar and content */}
								<div className="flex items-start gap-3 flex-1">
									{/* Avatar */}
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
											avatarColors[index % avatarColors.length]
										}`}
									>
										{chat.user.initials}
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<h4 className="font-medium text-gray-900 text-sm mb-1">
											{chat.user.name}
										</h4>
										<p className="text-gray-600 text-sm leading-relaxed">
											{chat.message}
										</p>
									</div>
								</div>

								{/* Right side - Time and status */}
								<div className="flex flex-col items-end gap-2 flex-shrink-0">
									<div className="text-right">
										<div className="text-sm text-gray-500">
											{chat.timestamp}
										</div>
										<div className="text-xs text-gray-400">{chat.date}</div>
									</div>
									<span
										className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${chat.statusColor}`}
									>
										{chat.status}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</DashboardLayout>
	);
}
