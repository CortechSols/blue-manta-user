import axios from "axios";
import { camelCase, snakeCase } from "change-case";
import { getAuthToken, setAuthToken, clearAuthToken } from "./auth-token";
import { queryClient } from "./react-query";
import { useCalendlyStore } from "@/stores/calendly/store";

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
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent infinite loops during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
}> = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      console.log(
        "Authorization header NOT added - Token:",
        !!token,
        "Not login:",
        !config.url?.includes("/login/")
      );
    }

    // Handle FormData vs JSON data
    if (config.data instanceof FormData) {
      // For FormData, convert field names to snake_case but preserve FormData structure
      const originalFormData = config.data;
      const convertedFormData = new FormData();

      console.log("🔍 FormData conversion - Original entries:");
      // Iterate through all form data entries and convert keys to snake_case
      for (const [key, value] of originalFormData.entries()) {
        const snakeKey = snakeCase(key);
        console.log(`  Converting: "${key}" -> "${snakeKey}"`);
        convertedFormData.append(snakeKey, value);
      }

      config.data = convertedFormData;

      // Remove Content-Type header so browser sets it automatically with boundary
      delete config.headers["Content-Type"];
      console.log(
        "FormData detected - Field names converted to snake_case and Content-Type header removed for multipart/form-data"
      );
    } else if (config.data && typeof config.data === "object") {
      // For regular objects, convert to snake_case and ensure JSON content type
      console.log("🔍 JSON conversion - Original data:", config.data);
      config.data = camelToSnake(config.data);
      console.log("🔍 JSON conversion - Converted data:", config.data);
      config.headers["Content-Type"] = "application/json";
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
      if (
        originalRequest.url?.includes("/refresh/") ||
        originalRequest.url?.includes("/login/")
      ) {
        // This is a refresh or login request that failed, logout user
        console.log("Refresh/Login request failed, logging out user");
        handleLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      // If we have a refresh token, try to refresh
      if (refreshToken) {
        try {
          const refreshResponse = await apiClient.post(
            "/auth/organizations/refresh/",
            {
              refresh: refreshToken,
            }
          );

          if (refreshResponse.status === 200) {
            // Update tokens
            const newAccessToken =
              refreshResponse.data.tokens?.access ||
              refreshResponse.data.access_token ||
              refreshResponse.data.access;
            const newRefreshToken =
              refreshResponse.data.tokens?.refresh ||
              refreshResponse.data.refresh_token ||
              refreshResponse.data.refresh;

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
  localStorage.removeItem("calendly-store");
  localStorage.removeItem("calendly_code_verifier");

  // Clear all React Query cache to prevent data leaking between users
  queryClient.invalidateQueries();

  // Clear Calendly store data
  useCalendlyStore.getState().actions.clearAllData();

  // Clear Zustand auth store if available
  try {
    const authStore = localStorage.getItem("auth-store");
    if (authStore) {
      const parsed = JSON.parse(authStore);
      if (parsed.state) {
        parsed.state.isAuthenticated = false;
        parsed.state.user = null;
        parsed.state.accessToken = null;
        parsed.state.refreshToken = null;
        localStorage.setItem("auth-store", JSON.stringify(parsed));
      }
    }
  } catch (e) {
    console.warn("Failed to clear auth store:", e);
  }

  // Redirect to login page
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// ChatbotAPIClient for widget compatibility
export class ChatbotAPIClient {
  // private baseUrl: string;

  // constructor(baseUrl: string) {
  //   this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
  // }

  async sendMessage(
    chatbotId: number,
    request: { message: string; visitor_id?: string }
  ): Promise<import("../types/chatbot").ChatResponse> {
    // For widget, we need to make unauthenticated requests
    const url = `${
      import.meta.env.VITE_API_BASE_URL
    }/chatbots/${chatbotId}/chat/`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return snakeToCamel(data) as import("../types/chatbot").ChatResponse;
    } catch (error) {
      console.error("Widget chat API request failed:", error);
      throw error;
    }
  }

  async getAppearance(
    chatbotId: number
  ): Promise<import("../types/chatbot").ChatbotAppearanceResponse> {
    // For widget, we need to make unauthenticated requests to the appearance endpoint
    const url = `${
      import.meta.env.VITE_API_BASE_URL
    }/chatbots/${chatbotId}/appearance/`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return snakeToCamel(
        data
      ) as import("../types/chatbot").ChatbotAppearanceResponse;
    } catch (error) {
      console.error("Widget appearance API request failed:", error);
      throw error;
    }
  }
}

// Utility to get config from URL parameters for widget
export function getConfigFromURL(): {
  chatbotId: number;
  apiBaseUrl: string;
  theme?: string;
  primaryColor?: string;
  greeting?: string;
} {
  const params = new URLSearchParams(window.location.search);

  const chatbotId = params.get("chatbotId");
  if (!chatbotId) {
    throw new Error(
      "chatbotId parameter is required (add ?chatbotId=X to URL)"
    );
  }

  return {
    chatbotId: parseInt(chatbotId, 10),
    apiBaseUrl: params.get("apiBaseUrl") || window.location.origin,
    theme: params.get("theme") || "light",
    primaryColor: params.get("primaryColor") || "#3b82f6",
    greeting: params.get("greeting") || "Hello! How can I help you today?",
  };
}

export default apiClient;
