import { useState, useEffect } from 'react';

// Simple auth state management without Zustand to avoid infinite loops
interface AuthState {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'auth-state';

// Get initial state from localStorage
function getInitialState(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        isAuthenticated: !!parsed.accessToken,
        user: parsed.user || null,
        isLoading: false,
        error: null,
      };
    }
  } catch (error) {
    console.warn('Failed to parse stored auth state:', error);
  }
  
  return {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  };
}

// Simple auth hook
export function useSimpleAuth() {
  const [authState, setAuthState] = useState<AuthState>(getInitialState);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(getInitialState());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return authState;
} 