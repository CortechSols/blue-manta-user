import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";

const teamMembers = [
	{
		name: "Team Member 1",
		permissions: "Edit Only",
		clientName: "",
		hasClient: false,
	},
	{
		name: "Team Member 2",
		permissions: "Read Only",
		clientName: "",
		hasClient: false,
	},
	{
		name: "SparkleBlue Pool Services",
		permissions: "Client Edit",
		clientName: "SparkleBlue Pool Services",
		hasClient: true,
	},
	{
		name: "All Around Wellness",
		permissions: "Client Edit",
		clientName: "Client",
		hasClient: true,
	},
];

const clientOptions = [
	{ value: "client", label: "Client" },
	{ value: "abc-hvac", label: "ABC HVAC Supplies" },
	{ value: "all-around", label: "All Around Wellness" },
	{ value: "baby-blue", label: "Baby Blue Pool Cleaning" },
];

export default function AdminProfilePage() {
	return (
		<DashboardLayout
			title="Blue Manta Labs"
			subtitle="Admin Profile"
			activePath="/settings"
		>
			<div className="border-2 border-[#0077B6] rounded-lg p-8 bg-white">
				<div className="space-y-8">
					{/* Profile Information */}
					<div className="space-y-6">
						<h3 className="text-xl font-semibold text-[#0077B6]">
							Profile Information
						</h3>

						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label className="text-sm text-gray-600">First Name</Label>
								<Input placeholder="Eg. your text here" className="h-11" />
							</div>
							<div className="space-y-2">
								<Label className="text-sm text-gray-600">Last Name</Label>
								<Input placeholder="Eg. your text here" className="h-11" />
							</div>
						</div>

						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label className="text-sm text-gray-600">Phone Number</Label>
								<div className="flex">
									<div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md h-11">
										<span className="text-sm text-gray-600">+81</span>
									</div>
									<Input
										placeholder="Eg. your text here"
										className="rounded-l-none h-11"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-sm text-gray-600">Contact Email</Label>
								<Input placeholder="Eg. your text here" className="h-11" />
							</div>
						</div>
					</div>

					{/* Password Section */}
					<div className="space-y-4">
						<h3 className="text-xl font-semibold text-[#0077B6]">Password</h3>
						<div className="space-y-3">
							<div className="flex items-center space-x-1">
								{Array.from({ length: 14 }, (_, i) => (
									<div key={i} className="w-2 h-2 bg-black rounded-full"></div>
								))}
							</div>
							<button className="text-gray-500 hover:text-[#0077B6] text-sm">
								Reset Password
							</button>
						</div>
					</div>

					{/* Access Controls */}
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<h3 className="text-xl font-semibold text-[#0077B6]">
								Access Controls
							</h3>
							<span className="px-3 py-1 bg-blue-50 text-[#0077B6] text-sm rounded-full border border-blue-200">
								Administrator
							</span>
						</div>

						<div className="border border-gray-200 rounded-lg overflow-hidden">
							{/* Table Header */}
							<div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
								<div className="p-4 text-sm font-medium text-gray-600">
									Name
								</div>
								<div className="p-4 text-sm font-medium text-gray-600">
									Permissions
								</div>
								<div className="p-4 text-sm font-medium text-gray-600">
									Client Name
								</div>
							</div>

							{/* Table Rows */}
							{teamMembers.map((member, index) => (
								<div
									key={index}
									className="grid grid-cols-3 items-center border-b border-gray-100 last:border-b-0"
								>
									<div className="p-4">
										<span className="text-sm text-gray-800">{member.name}</span>
									</div>

									<div className="p-4">
										<Select
											defaultValue={member.permissions
												.toLowerCase()
												.replace(" ", "-")}
										>
											<SelectTrigger className="h-9">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="edit-only">Edit Only</SelectItem>
												<SelectItem value="read-only">Read Only</SelectItem>
												<SelectItem value="client-edit">Client Edit</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="p-4">
										{member.hasClient ? (
											<Select
												defaultValue={member.clientName
													.toLowerCase()
													.replace(" ", "-")}
											>
												<SelectTrigger className="h-9">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{clientOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										) : (
											<span className="text-gray-400 text-sm">-</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
