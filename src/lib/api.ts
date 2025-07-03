import axios from "axios";
import { camelCase, snakeCase } from "change-case";
import { getAuthToken, setAuthToken, clearAuthToken } from "./auth-token";

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

// Flag to prevent infinite loops during token refresh
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: any) => void;
	reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error);
		} else {
			resolve(token);
		}
	});
	
	failedQueue = [];
};

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
		if (response.data) {
			response.data = snakeToCamel(response.data);
		}
		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		
		// Handle 401 Unauthorized errors
		if (error.response?.status === 401 && !originalRequest._retry) {
			// Don't retry refresh token requests to prevent infinite loops
			if (originalRequest.url?.includes("/refresh/") || originalRequest.url?.includes("/login/")) {
				// This is a refresh or login request that failed, logout user
				console.log("Refresh/Login request failed, logging out user");
				handleLogout();
				return Promise.reject(error);
			}
			
			if (isRefreshing) {
				// If already refreshing, queue this request
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then(token => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return apiClient(originalRequest);
				}).catch(err => {
					return Promise.reject(err);
				});
			}
			
			originalRequest._retry = true;
			isRefreshing = true;
			
			const refreshToken = localStorage.getItem("refreshToken");
			
			// If we have a refresh token, try to refresh
			if (refreshToken) {
				try {
					const refreshResponse = await apiClient.post("/auth/organizations/refresh/", {
						refresh: refreshToken,
					});
					
					if (refreshResponse.status === 200) {
						// Update tokens
						const newAccessToken = refreshResponse.data.tokens?.access || refreshResponse.data.access_token || refreshResponse.data.access;
						const newRefreshToken = refreshResponse.data.tokens?.refresh || refreshResponse.data.refresh_token || refreshResponse.data.refresh;
						
						// Update localStorage
						localStorage.setItem("accessToken", newAccessToken);
						if (newRefreshToken) {
							localStorage.setItem("refreshToken", newRefreshToken);
						}
						
						// Update auth token utility
						setAuthToken(newAccessToken);
						
						// Process queued requests
						processQueue(null, newAccessToken);
						
						// Retry the original request with new token
						originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
						return apiClient(originalRequest);
					}
				} catch (refreshError) {
					console.error("Token refresh failed:", refreshError);
					processQueue(refreshError, null);
					handleLogout();
					return Promise.reject(refreshError);
				} finally {
					isRefreshing = false;
				}
			} else {
				// No refresh token available
				isRefreshing = false;
				handleLogout();
				return Promise.reject(error);
			}
		}
		
		// Convert error response data
		if (error.response?.data) {
			error.response.data = snakeToCamel(error.response.data);
		}
		
		return Promise.reject(error);
	}
);

// Helper function to handle logout
function handleLogout() {
	console.log("Authentication failed, logging out user");
	
	// Clear all auth data
	clearAuthToken();
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
	localStorage.removeItem("userType");
	localStorage.removeItem("userInfo");
	localStorage.removeItem("organizationInfo");
	
	// Clear Zustand auth store if available
	try {
		const authStore = localStorage.getItem('auth-store');
		if (authStore) {
			const parsed = JSON.parse(authStore);
			if (parsed.state) {
				parsed.state.isAuthenticated = false;
				parsed.state.user = null;
				parsed.state.accessToken = null;
				parsed.state.refreshToken = null;
				localStorage.setItem('auth-store', JSON.stringify(parsed));
			}
		}
	} catch (e) {
		console.warn('Failed to clear auth store:', e);
	}
	
	// Redirect to login page
	if (window.location.pathname !== '/login') {
		window.location.href = '/login';
	}
}

export default apiClient;
