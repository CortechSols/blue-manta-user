import { Calendar, ExternalLink, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCalendlyConnect } from "@/hooks/useCalendly";
import { useGetCalendlyStatus } from "@/hooks/useApi";

const CalendlyConnectState = ({
	onConnect,
	isLoading,
}: {
	onConnect: () => void;
	isLoading: boolean;
}) => (
	<div className="flex flex-col items-center justify-center py-16 px-8">
		<div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
			<Calendar className="w-10 h-10 text-blue-600" />
		</div>
		<h3 className="text-2xl font-semibold text-gray-900 mb-4">
			Connect Your Calendly Account
		</h3>
		<p className="text-gray-600 text-center max-w-md mb-8">
			To manage your appointment scheduling, connect your Calendly account to
			sync your event types and bookings.
		</p>
		<Button
			className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
			onClick={onConnect}
			disabled={isLoading}
		>
			{isLoading ? (
				<RefreshCw className="w-4 h-4 animate-spin" />
			) : (
				<ExternalLink className="w-4 h-4" />
			)}
			{isLoading ? "Connecting..." : "Connect to Calendly"}
		</Button>
		<p className="text-sm text-gray-500 mt-4">
			You'll be redirected to Calendly to authorize the connection
		</p>
	</div>
);

const CalendlyConnectedState = ({
	schedulingUrl,
	userName,
}: {
	schedulingUrl: string;
	userName: string;
}) => (
	<div className="space-y-6">
		{/* Connected Status */}
		<div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
					<User className="w-5 h-5 text-green-600" />
				</div>
				<div>
					<h4 className="font-medium text-green-800">Calendly Connected</h4>
					<p className="text-sm text-green-600">Connected as: {userName}</p>
				</div>
			</div>
			<div className="w-3 h-3 bg-green-500 rounded-full"></div>
		</div>

		{/* Scheduling Interface */}
		<div className="bg-white rounded-lg border">
			<div className="p-4 border-b">
				<h4 className="font-semibold text-gray-900">Schedule Appointments</h4>
				<p className="text-sm text-gray-600 mt-1">
					Your Calendly scheduling page is embedded below
				</p>
			</div>
			<div className="p-4">
				<iframe
					src={schedulingUrl}
					width="100%"
					height="600"
					frameBorder="0"
					title="Calendly Scheduling"
					className="rounded border"
				></iframe>
			</div>
		</div>

		{/* Direct Link */}
		<div className="p-4 bg-gray-50 rounded-lg">
			<div className="flex items-center justify-between">
				<div>
					<h5 className="font-medium text-gray-900">Direct Scheduling Link</h5>
					<p className="text-sm text-gray-600 mt-1">
						Share this link with clients to book appointments
					</p>
					<code className="text-xs bg-white px-2 py-1 rounded mt-2 inline-block border">
						{schedulingUrl}
					</code>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						navigator.clipboard.writeText(schedulingUrl);
						// You could add a toast notification here
					}}
				>
					Copy Link
				</Button>
			</div>
		</div>
		<div
			className="calendly-inline-widget"
			data-url="https://calendly.com/mawaisjatt4/calendly-intro4"
			style={{ minWidth: "320px", height: "630px" }}
		></div>
		<script
			type="text/javascript"
			src="https://assets.calendly.com/assets/external/widget.js"
			async
		></script>
	</div>
);

export default function CalendarPage() {
	const { initiateOAuth, isPending, error } = useCalendlyConnect();
	// const { data: calendlyStatus, isLoading: isStatusLoading } =
	// 	useGetCalendlyStatus();

	const calendlyStatus = undefined;
	const isStatusLoading = false;

	const handleConnect = () => {
		initiateOAuth();
	};

	// Show error if any
	if (error) {
		return (
			<DashboardLayout
				title="SparkleBlue Pool Services"
				subtitle="Appointment Calendar"
				activePath="/calendar"
			>
				<div className="border-2 border-red-200 rounded-lg bg-red-50 p-8">
					<div className="text-center">
						<h3 className="text-xl font-semibold text-red-800 mb-4">
							Connection Error
						</h3>
						<p className="text-red-600 mb-6">
							{error.message || "Failed to connect to Calendly"}
						</p>
						<Button
							onClick={() => window.location.reload()}
							className="bg-red-600 text-white hover:bg-red-700"
						>
							Try Again
						</Button>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout
			title="SparkleBlue Pool Services"
			subtitle="Appointment Calendar"
			activePath="/calendar"
		>
			<div className="border-2 border-[#0077B6] rounded-lg bg-white">
				<div className="p-8">
					<h3 className="text-2xl font-semibold text-[#0077B6] mb-8">
						Scheduling Integration
					</h3>

					{isStatusLoading ? (
						<div className="flex items-center justify-center py-16">
							<RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
							<span className="ml-2 text-gray-600">
								Loading calendar status...
							</span>
						</div>
					) : calendlyStatus?.isConnected ? (
						<CalendlyConnectedState
							schedulingUrl={calendlyStatus.schedulingUrl}
							userName={calendlyStatus.userName}
						/>
					) : (
						<CalendlyConnectState
							onConnect={handleConnect}
							isLoading={isPending}
						/>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
