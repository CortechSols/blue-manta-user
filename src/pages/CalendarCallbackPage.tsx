import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useCalendlyConnect } from "@/hooks/useCalendly";

export default function CalendarCallbackPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const code = searchParams.get("code");
	const errorParam = searchParams.get("error");
	const [isConnected, setIsConnected] = useState(false);

	const { connect, isPending, error, isSuccess } = useCalendlyConnect();

	useEffect(() => {
		if (code && !isPending && !isConnected) {
			connect(code)
				.then(() => {
					setIsConnected(true);
					setTimeout(() => {
						navigate("/calendar");
					}, 2000);
				})
				.catch(console.error);
		} else if (errorParam) {
			console.error("OAuth error:", errorParam);
		}
	}, [code, errorParam, connect, isPending, isConnected, navigate]);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
				{isPending && (
					<>
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
						</div>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">
							Connecting to Calendly
						</h2>
						<p className="text-gray-600 mb-6">
							Please wait while we complete your Calendly integration...
						</p>
					</>
				)}

				{isConnected && isSuccess && (
					<>
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<CheckCircle className="w-8 h-8 text-green-600" />
						</div>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">
							Successfully Connected!
						</h2>
						<p className="text-gray-600 mb-6">
							Your Calendly account has been connected successfully. Redirecting
							you to the calendar page...
						</p>
					</>
				)}

				{(error || errorParam) && (
					<>
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<XCircle className="w-8 h-8 text-red-600" />
						</div>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">
							Connection Failed
						</h2>
						<p className="text-gray-600 mb-6">
							{error?.message ||
								errorParam ||
								"Failed to connect to Calendly. Please try again."}
						</p>
						<button
							onClick={() => navigate("/calendar")}
							className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Back to Calendar
						</button>
					</>
				)}
			</div>
		</div>
	);
}
