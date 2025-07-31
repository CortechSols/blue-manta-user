import { QueryClient } from "@tanstack/react-query";

// API Response Types
export interface CalendlyConnectRequest {
	code: string;
}

export interface CalendlyConnectResponse {
	isConnected: boolean;
	schedulingUrl: string;
	userName: string;
}

// Create a client
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
			retry: 2,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
		},
		mutations: {
			retry: 1,
			retryDelay: 1000,
		},
	},
});
