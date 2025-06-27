import axios from "axios";
import { camelCase, snakeCase } from "change-case";
import { getAuthToken } from "./auth-token";

// Simple function to convert object keys recursively
function convertKeys(
	obj: unknown,
	converter: (key: string) => string
): unknown {
	if (obj === null || obj === undefined || typeof obj !== "object") {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => convertKeys(item, converter));
	}

	// Skip conversion for special objects
	if (
		obj instanceof Date ||
		obj instanceof File ||
		obj instanceof FormData ||
		obj instanceof Blob
	) {
		return obj;
	}

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		const newKey = typeof key === "string" ? converter(key) : key;
		result[newKey] = convertKeys(value, converter);
	}
	return result;
}

// Convert camelCase to snake_case
export function camelToSnake(obj: unknown): unknown {
	return convertKeys(obj, snakeCase);
}

// Convert snake_case to camelCase
export function snakeToCamel(obj: unknown): unknown {
	return convertKeys(obj, camelCase);
}

// Create axios instance
export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor
apiClient.interceptors.request.use(
	(config) => {
		// Add authorization header if token exists
		// Try to get token from auth store first, fallback to localStorage for backward compatibility
		let token: string | null = null;
		
		// Get token using the utility function
		token = getAuthToken();
		console.log("Token from auth utility:", token ? "Present" : "Missing");
		
		console.log("Request URL:", config.url);
		console.log("Token available:", token ? "Yes" : "No");
		console.log("Is login URL:", config.url?.includes("/login/"));
		
		if (token && !config.url?.includes("/login/")) {
			config.headers.Authorization = `Bearer ${token}`;
			console.log("Authorization header added");
		} else {
			console.log("Authorization header NOT added - Token:", !!token, "Not login:", !config.url?.includes("/login/"));
		}

		if (
			config.data &&
			typeof config.data === "object" &&
			!(config.data instanceof FormData)
		) {
			config.data = camelToSnake(config.data);
		}
		if (config.params) {
			config.params = camelToSnake(config.params);
		}
		console.log("config url -->>> ", config);
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
	(response) => {
		if (response.status === 401) {
			const refreshToken = localStorage.getItem("refreshToken");
			if (refreshToken) {
				(async () => {
					const refreshResponse = await apiClient.post("/token/refresh/", {
						refresh: refreshToken,
					});
					if (refreshResponse.status === 200) {
						localStorage.setItem("accessToken", refreshResponse.data.access);
						response.config.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
						return apiClient(response.config);
					}
				})();
			}
		}
		if (response.data) {
			response.data = snakeToCamel(response.data);
		}
		return response;
	},
	(error) => {
		if (error.response?.data) {
			error.response.data = snakeToCamel(error.response.data);
		}
		return Promise.reject(error);
	}
);

export default apiClient;
