import { create } from "zustand";
import type { PipedreamIntegration } from "@/types/integration";

interface PipedreamIntegrationState {
  integration: PipedreamIntegration | null;
  loading: boolean;
  error: string | null;
  setIntegration: (integration: PipedreamIntegration | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const usePipedreamIntegrationStore = create<PipedreamIntegrationState>((set) => ({
  integration: null,
  loading: false,
  error: null,
  setIntegration: (integration) => set({ integration }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clear: () => set({ integration: null, loading: false, error: null }),
})); 