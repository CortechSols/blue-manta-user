// Simple utility to get auth token without circular dependencies

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAuthToken = (): string | null => {
  // Try memory first
  if (authToken) {
    return authToken;
  }
  
  // Try localStorage
  try {
    // Check Zustand persist store first
    const authStore = localStorage.getItem('auth-store');
    if (authStore) {
      const parsed = JSON.parse(authStore);
      if (parsed.state?.accessToken) {
        authToken = parsed.state.accessToken;
        return authToken;
      }
    }
    
    // Fallback to direct localStorage
    authToken = localStorage.getItem('accessToken');
    return authToken;
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null;
  }
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('accessToken');
}; 