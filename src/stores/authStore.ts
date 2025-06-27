import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { demoLogin, demoRefreshToken, shouldUseDemoAuth } from '@/lib/demo-auth';
import { apiClient } from '@/lib/api';
import { setAuthToken, clearAuthToken } from '@/lib/auth-token';

interface User {
  id: number;
  email: string;
  name?: string;
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
    if (!token || typeof token !== 'string') {
      return true;
    }
    
    const parts = token.split('.');
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
    console.warn('Token parsing error:', error);
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
              let data;
              
              if (shouldUseDemoAuth()) {
                // Use demo authentication
                data = await demoLogin({ email, password });
              } else {
                // Use real API
                const response = await apiClient.post('/auth/organizations/login/', {
                  email,
                  password,
                });

                data = response.data;
              }
              
              console.log('Login response data:', data);
              
              // Extract tokens and user data from the correct response format
              const accessToken = data.tokens?.access || data.access_token;
              const refreshToken = data.tokens?.refresh || data.refresh_token;
              const user = data.organization || data.user;
              
              set((state) => {
                state.isAuthenticated = true;
                state.accessToken = accessToken;
                state.refreshToken = refreshToken;
                state.user = user;
                state.isLoading = false;
              });
              
              console.log('Auth state updated, tokens saved:', { accessToken: !!accessToken, refreshToken: !!refreshToken, user: !!user });
              
              // Sync token with utility
              setAuthToken(accessToken);
            } catch (error: any) {
              let errorMessage = 'Login failed';
              
              if (error.response?.data?.message) {
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
              throw new Error('No refresh token available');
            }

            try {
              let data;
              
              if (shouldUseDemoAuth()) {
                // Use demo token refresh
                data = await demoRefreshToken(refreshToken);
              } else {
                // Use real API
                const response = await apiClient.post('/auth/organizations/refresh/', {
                  refresh: refreshToken,
                });

                data = response.data;
              }
              
              // Extract tokens from the correct response format
              const newAccessToken = data.tokens?.access || data.access_token || data.access;
              const newRefreshToken = data.tokens?.refresh || data.refresh_token || data.refresh;
              
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
              console.warn('Token validation error:', error);
              return false;
            }
          },
        },
      })),
      {
        name: 'auth-store',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Individual selector hooks to prevent infinite loops
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useRefreshToken = () => useAuthStore((state) => state.refreshToken);

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