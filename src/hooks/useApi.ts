import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { queryClient } from "../lib/react-query";
import { useCalendlyStore } from "@/stores/calendly/store";
import type {
  CalendlyConnectRequest,
  CalendlyConnectResponse,
} from "../lib/react-query";

// Unified login response type
type UnifiedLoginResponse = {
  tokens: {
    access: string;
    refresh: string;
  };
  user?: unknown;
  organization?: unknown;
};

// Base API hook for GET requests
export function useApiQuery<T>(
  queryKey: readonly unknown[],
  endpoint: string,
  options?: any
) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    ...options,
  });
}

// Base API hook for POST/PUT/PATCH/DELETE requests
export function useApiMutation<TData, TVariables>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (
      data: TData | undefined,
      error: Error | null,
      variables: TVariables
    ) => void;
  }
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      let response;
      switch (method) {
        case "POST":
          response = await apiClient.post(endpoint, variables);
          break;
        case "PUT":
          response = await apiClient.put(endpoint, variables);
          break;
        case "PATCH":
          response = await apiClient.patch(endpoint, variables);
          break;
        case "DELETE":
          response = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data, error, variables);
    },
  });
}

// Unified Login Hook (New)
export function useLogin() {
  return useMutation<
    UnifiedLoginResponse,
    Error,
    { email: string; password: string }
  >({
    mutationFn: async (credentials) => {
      const response = await apiClient.post(
        "/auth/organizations/login/",
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Clear React Query cache to ensure fresh data for new user
      queryClient.invalidateQueries();

      // Clear Calendly store data for fresh start
      useCalendlyStore.getState().actions.clearAllData();

      // Store tokens in localStorage
      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);

      // Store user type and info based on response structure
      if (data.user) {
        localStorage.setItem("userType", "platform_admin");
        localStorage.setItem("userInfo", JSON.stringify(data.user));
      }
      if (data.organization) {
        localStorage.setItem("userType", "organization");
        localStorage.setItem(
          "organizationInfo",
          JSON.stringify(data.organization)
        );
      }
    },
  });
}

// Chatbots API hooks - Updated to use new chatbot service
export function useChatbots() {
  return useApiQuery(["chatbots", "list"], "/chatbots/chatbots");
}

export function useCreateChatbot() {
  return useApiMutation("/chatbots/chatbots", "POST");
}

// Organizations API hooks (for platform admin)
export function useOrganizations() {
  return useApiQuery(["organizations", "list"], "/auth/organizations/");
}

export function useCreateOrganization() {
  return useApiMutation("/auth/organizations/", "POST");
}

export function useDeleteOrganization() {
  return useApiMutation("/auth/organizations/", "DELETE");
}

// Auth utilities
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("accessToken");
}

export function getUserType(): string | null {
  return localStorage.getItem("userType");
}

export function logout(): void {
  // Clear all React Query cache to prevent data leaking between users
  queryClient.invalidateQueries();

  // Clear Calendly store data
  useCalendlyStore.getState().actions.clearAllData();

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userType");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("organizationInfo");
  localStorage.removeItem("calendly-store");
  localStorage.removeItem("calendly_code_verifier");
}

// Calendly Integration Hooks
export function useCalendlyConnect() {
  return useMutation<CalendlyConnectResponse, Error, CalendlyConnectRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        "/integrations/calendly/connect/",
        data
      );
      return response.data;
    },
    onSuccess: () => {},
    onError: (error) => {
      console.error("Calendly connection failed:", error);
    },
  });
}

export function useGetCalendlyStatus() {
  return useQuery<CalendlyConnectResponse, Error>({
    queryKey: ["calendly", "status"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/integrations/calendly/connection_status/"
      );
      return response.data;
    },
  });
}
