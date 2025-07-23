import type { StateCreator } from "zustand";
import type { CalendlyStore, ConnectionActions } from "../types";
import { calendlyService } from "../../../lib/calendly-service";
import { createErrorMessage } from "../utils";

/**
 * Connection management actions for Calendly store
 */
export const createConnectionActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore["actions"], keyof ConnectionActions> }
> = (set, get) => ({
  actions: {
    setConnectionStatus: (status) =>
      set((state) => {
        state.connectionStatus = status;
        return state;
      }),

    checkConnectionStatus: async () => {
      set((state) => {
        state.loading.connection = true;
        state.error = null;
        return state;
      });

      try {
        const response = await calendlyService.getConnectionStatus();
        console.log("Store - Connection status response:", response);

        set((state) => {
          state.connectionStatus = response;
          state.loading.connection = false;
          return state;
        });

        console.log("Store - Connection status updated in store");

        // If connected, load initial data
        if (response.is_connected) {
          console.log("Store - Loading initial data...");
          await get().actions.refreshAll();
        }
      } catch (error) {
        console.error("Store - Connection status check failed:", error);
        set((state) => {
          state.error = createErrorMessage("check connection status", error);
          state.loading.connection = false;
          return state;
        });
      }
    },

    connectCalendly: async (code) => {
      set((state) => {
        state.loading.connection = true;
        state.error = null;
        return state;
      });

      try {
        // Get code_verifier from localStorage (PKCE)
        const codeVerifier = localStorage.getItem("calendly_code_verifier");

        const response = await calendlyService.connectCalendly(
          code,
          codeVerifier || undefined
        );

        // Clear the code verifier after use
        if (codeVerifier) {
          localStorage.removeItem("calendly_code_verifier");
        }

        set((state) => {
          state.connectionStatus = response;
          state.loading.connection = false;
          return state;
        });

        // Load initial data after connection
        await get().actions.refreshAll();
      } catch (error) {
        set((state) => {
          state.error = createErrorMessage("connect Calendly", error);
          state.loading.connection = false;
          return state;
        });
        throw error;
      }
    },

    disconnectCalendly: async () => {
      set((state) => {
        state.loading.connection = true;
        return state;
      });

      try {
        await calendlyService.disconnectCalendly();
        set((state) => {
          state.connectionStatus = { is_connected: false };
          state.events = [];
          state.meetings = [];
          state.eventTypes = [];
          state.availabilitySchedules = [];
          state.loading.connection = false;
          return state;
        });
      } catch (error) {
        set((state) => {
          state.error = createErrorMessage("disconnect Calendly", error);
          state.loading.connection = false;
          return state;
        });
        throw error;
      }
    },
  },
});
