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
  timeout: 300000,
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

apiClient.interceptors.request.use(
  (config) => {
    let token: string | null = null;

    token = getAuthToken();
    if (token && !config.url?.includes("/login/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      const originalFormData = config.data;
      const convertedFormData = new FormData();

      for (const [key, value] of originalFormData.entries()) {
        const snakeKey = snakeCase(key);
        convertedFormData.append(snakeKey, value);
      }

      config.data = convertedFormData;


      delete config.headers["Content-Type"];
    } else if (config.data && typeof config.data === "object") {

      config.data = camelToSnake(config.data);
      config.headers["Content-Type"] = "application/json";
    }

    if (config.params) {
      config.params = camelToSnake(config.params);
    }
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

  async getVisitorMessages(
    visitorId: string
  ): Promise<import("../types/chatbot").VisitorMessagesResponse> {
    // For widget, we need to make unauthenticated requests to get visitor messages
    const url = `${
      import.meta.env.VITE_API_BASE_URL
    }/conversations/visitor-messages/?visitor_id=${encodeURIComponent(
      visitorId
    )}`;

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
      ) as import("../types/chatbot").VisitorMessagesResponse;
    } catch (error) {
      console.error("Widget visitor messages API request failed:", error);
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
