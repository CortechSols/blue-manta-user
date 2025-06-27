import { calendlyAuth } from "@/lib/calendly-api";
import { useCalendlyConnect as useCalendlyConnectMutation } from "@/hooks/useApi";

// Hook to handle OAuth connection
export function useCalendlyConnect() {
	const connectMutation = useCalendlyConnectMutation();

	const initiateOAuth = () => {
		calendlyAuth.initiateOAuth();
	};

	const connect = (code: string) => {
		return connectMutation.mutateAsync({ code });
	};

	return {
		initiateOAuth,
		connect,
		isPending: connectMutation.isPending,
		error: connectMutation.error,
		isSuccess: connectMutation.isSuccess,
	};
}
