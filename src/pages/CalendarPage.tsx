import { useEffect } from "react";
import { Calendar, ExternalLink, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendlyDashboard } from "@/components/calendly/CalendlyDashboard";
import { useCalendlyConnect } from "@/hooks/useCalendly";
import { useCalendlyConnection, useCalendlyActions, useCalendlyLoading } from "@/stores/calendlyStore";

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

export default function CalendarPage() {
	const { initiateOAuth, isPending, error } = useCalendlyConnect();
	const connectionStatus = useCalendlyConnection();
	const { checkConnectionStatus } = useCalendlyActions();
	const loading = useCalendlyLoading();

	// Check connection status and load data on mount
	useEffect(() => {
		console.log('CalendarPage - connectionStatus:', connectionStatus);
		console.log('CalendarPage - loading.connection:', loading.connection);
		
		if (!connectionStatus) {
			// Try to load data directly - if it succeeds, we're connected
			checkConnectionStatus().catch(() => {
				// If checking status fails, assume not connected
				console.log('Connection status check failed, assuming not connected');
			});
		}
	}, [connectionStatus, checkConnectionStatus]);

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
						Calendar Management
					</h3>

					{(() => {
						console.log('Render decision:', {
							loadingConnection: loading.connection,
							isConnected: connectionStatus?.is_connected,
							connectionStatus: connectionStatus
						});
						
						if (loading.connection) {
							return (
								<div className="flex flex-col items-center justify-center py-16 px-8">
									<RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
									<p className="text-gray-600">Checking Calendly connection...</p>
								</div>
							);
						}
						
						if (connectionStatus?.is_connected) {
							return <CalendlyDashboard />;
						}
						
						return (
							<CalendlyConnectState
								onConnect={handleConnect}
								isLoading={isPending}
							/>
						);
					})()}
				</div>
			</div>
		</DashboardLayout>
	);
}
