import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { CalendlyStore } from "./types";
import { createInitialState, createPersistConfig } from "./initialState";
import { createConnectionActions } from "./actions/connectionActions";
import { createDataActions } from "./actions/dataActions";
import { createMeetingActions } from "./actions/meetingActions";
import {
  createUIActions,
  createModalActions,
  createUtilityActions,
} from "./actions/uiActions";

/**
 * Main Calendly store combining all modular actions and state
 *
 * This store is designed to be:
 * - Modular: Each action group is in its own file
 * - Scalable: Easy to add new features without cluttering
 * - Readable: Clear separation of concerns
 * - Type-safe: Full TypeScript support
 * - Performant: Optimized selectors and state updates
 */
export const useCalendlyStore = create<CalendlyStore>()(
  devtools(
    persist(
      immer((set, get, store) => {
        const initialState = createInitialState();

        // Get all action groups
        const connectionActions = createConnectionActions(
          set,
          get,
          store
        ).actions;
        const dataActions = createDataActions(set, get, store).actions;
        const meetingActions = createMeetingActions(set, get, store).actions;
        const uiActions = createUIActions(set, get, store).actions;
        const modalActions = createModalActions(set, get, store).actions;
        const utilityActions = createUtilityActions(set, get, store).actions;

        return {
          ...initialState,
          actions: {
            // Connection management
            ...connectionActions,

            // Data loading
            ...dataActions,

            // Meeting management
            ...meetingActions,

            // UI management
            ...uiActions,

            // Modal management
            ...modalActions,

            // Utility functions
            ...utilityActions,

            // Alias for checkConnectionStatus
            checkConnection: connectionActions.checkConnectionStatus,
          },
        };
      }),
      createPersistConfig()
    ),
    {
      name: "calendly-store",
    }
  )
);
