import { QueryClient } from "@tanstack/react-query";

// Query Keys
export const queryKeys = {
	auth: {
		platformAdmin: {
			login: () => ["auth", "platform-admin", "login"] as const,
		},
		organization: {
			login: () => ["auth", "organization", "login"] as const,
		},
	},
	chatbots: {
		list: () => ["chatbots", "list"] as const,
		detail: (id: string) => ["chatbots", "detail", id] as const,
	},
	calendly: {
		status: () => ["calendly", "status"] as const,
		user: () => ["calendly", "user"] as const,
		eventTypes: () => ["calendly", "eventTypes"] as const,
		connect: () => ["calendly", "connect"] as const,
		sync: () => ["calendly", "sync"] as const,
	},
} as const;

// API Response Types
export interface PlatformAdminLoginRequest {
	email: string;
	password: string;
}

export interface PlatformAdminLoginResponse {
	tokens: {
		access: string;
		refresh: string;
	};
	user: {
		id: string;
		email: string;
		username: string;
		type: "platform_admin";
	};
}

export interface OrganizationLoginRequest {
	email: string;
	password: string;
}

export interface OrganizationLoginResponse {
	tokens: {
		access: string;
		refresh: string;
	};
	organization: {
		id: string;
		contactEmail: string;
		firstName: string;
		lastName: string;
		type: "organization";
	};
}

// Calendly API Types
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
