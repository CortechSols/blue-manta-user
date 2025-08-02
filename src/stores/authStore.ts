import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { apiClient } from "@/lib/api";
import { setAuthToken, clearAuthToken } from "@/lib/auth-token";
import { queryClient } from "@/lib/react-query";
import { useCalendlyStore } from "@/stores/calendly/store";

interface User {
  id: number;
  email: string;
  organizationName?: string;
  organization_id?: number;
}

interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Authentication actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  clearError: () => void;

  // Token management
  refreshAccessToken: () => Promise<void>;
  isTokenValid: () => boolean;
}

interface AuthStore extends AuthState {
  actions: AuthActions;
}

// Helper function to decode JWT and check expiry
function isTokenExpired(token: string): boolean {
  try {
    if (!token || typeof token !== "string") {
      return true;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return true;
    }

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.warn("Token parsing error:", error);
    return true;
  }
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,

        actions: {
          login: async (email: string, password: string) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const response = await apiClient.post(
                "/auth/organizations/login/",
                {
                  email,
                  password,
                }
              );

              const data = response.data;
              const accessToken = data.tokens?.access;
              const refreshToken = data.tokens?.refresh;
              const user = data.organization;

              set((state) => {
                state.isAuthenticated = true;
                state.accessToken = accessToken;
                state.refreshToken = refreshToken;
                state.user = user;
                state.isLoading = false;
              });

              // Clear React Query cache to ensure fresh data for new user
              queryClient.invalidateQueries();

              // Clear Calendly store data for fresh start
              useCalendlyStore.getState().actions.clearAllData();

              // Sync token with utility
              setAuthToken(accessToken);
            } catch (error: any) {
              let errorMessage = "Login failed";

              // Check for different error response formats
              if (
                error.response?.data?.nonFieldErrors &&
                Array.isArray(error.response.data.nonFieldErrors)
              ) {
                errorMessage = error.response.data.nonFieldErrors[0];
              } else if (
                error.response?.data?.non_field_errors &&
                Array.isArray(error.response.data.non_field_errors)
              ) {
                errorMessage = error.response.data.non_field_errors[0];
              } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
              } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
              } else if (error.message) {
                errorMessage = error.message;
              }

              set((state) => {
                state.error = errorMessage;
                state.isLoading = false;
              });
              throw error;
            }
          },

          logout: () => {
            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
              state.accessToken = null;
              state.refreshToken = null;
              state.error = null;
            });

            // Clear token from utility
            clearAuthToken();

            // Clear all React Query cache to prevent data leaking between users
            queryClient.invalidateQueries();

            // Clear Calendly store data
            useCalendlyStore.getState().actions.clearAllData();

            // Also clear localStorage items
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userType");
            localStorage.removeItem("userInfo");
            localStorage.removeItem("organizationInfo");
            localStorage.removeItem("calendly-store");
            localStorage.removeItem("calendly_code_verifier");
          },

          setTokens: (accessToken: string, refreshToken?: string) => {
            set((state) => {
              state.accessToken = accessToken;
              if (refreshToken) {
                state.refreshToken = refreshToken;
              }
              state.isAuthenticated = true;
            });

            // Sync token with utility
            setAuthToken(accessToken);
          },

          setUser: (user: User) => {
            set((state) => {
              state.user = user;
            });
          },

          clearError: () => {
            set((state) => {
              state.error = null;
            });
          },

          refreshAccessToken: async () => {
            const { refreshToken } = get();

            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            try {
              const response = await apiClient.post(
                "/auth/organizations/refresh/",
                {
                  refresh: refreshToken,
                }
              );

              const data = response.data;

              const newAccessToken = data.tokens?.access;
              const newRefreshToken = data.tokens?.refresh;

              set((state) => {
                state.accessToken = newAccessToken;
                if (newRefreshToken) {
                  state.refreshToken = newRefreshToken;
                }
              });

              // Sync token with utility
              setAuthToken(newAccessToken);
            } catch (error) {
              // If refresh fails, logout the user
              get().actions.logout();
              throw error;
            }
          },

          isTokenValid: () => {
            try {
              const { accessToken } = get();
              return accessToken ? !isTokenExpired(accessToken) : false;
            } catch (error) {
              console.warn("Token validation error:", error);
              return false;
            }
          },
        },
      })),
      {
        name: "auth-store",
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
);

// Individual selector hooks to prevent infinite loops
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useRefreshToken = () =>
  useAuthStore((state) => state.refreshToken);

// Combined selector hooks with proper memoization
export const useAuth = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
  };
};

export const useAuthActions = () => useAuthStore((state) => state.actions);

export const useAuthTokens = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return {
    accessToken,
    refreshToken,
  };
};
