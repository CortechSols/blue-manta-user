import { calendlyAuth } from "@/lib/calendly-api";
import { useCalendlyActions } from "@/stores/calendlyStore";
import { useState } from "react";

// Hook to handle OAuth connection
export function useCalendlyConnect() {
	const actions = useCalendlyActions();
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const initiateOAuth = async () => {
		await calendlyAuth.initiateOAuth();
	};

	const connect = async (code: string) => {
		setIsPending(true);
		setError(null);
		setIsSuccess(false);
		
		try {
			await actions.connectCalendly(code);
			setIsSuccess(true);
			return true;
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Failed to connect');
			setError(error);
			throw error;
		} finally {
			setIsPending(false);
		}
	};

	return {
		initiateOAuth,
		connect,
		isPending,
		error,
		isSuccess,
	};
}
