import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { CalendlyStore } from "./types";
import { createInitialState, createPersistConfig } from "./initialState";
import { createConnectionActions } from "./actions/connectionActions";
import { createDataActions } from "./actions/dataActions";
import { createMeetingActions } from "./actions/meetingActions";
import { createEventTypeActions } from "./actions/eventTypeActions";
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
        const eventTypeActions = createEventTypeActions(
          set,
          get,
          store
        ).actions;
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

            // Event type management
            ...eventTypeActions,

            // UI management
            ...uiActions,

            // Modal management
            ...modalActions,

            // Utility functions
            ...utilityActions,

            // Additional required actions that aren't in the individual action groups
            closeAllModals: () => {
              set((state) => {
                state.modals = {
                  meetingDetails: { isOpen: false, meeting: null },
                  cancelMeeting: { isOpen: false, meetingUri: null },
                  eventTypeDetails: { isOpen: false, eventType: null },
                  rescheduleMeeting: { isOpen: false, meetingUri: null },
                  availabilityEditor: { isOpen: false },
                  bookingForm: { isOpen: false, eventTypeUri: null },
                };
                return state;
              });
            },

            // Alias for checkConnectionStatus
            checkConnection: connectionActions.checkConnectionStatus,

            // Event type actions (not supported by API, but required by interface)
            createEventType: async () => {
              throw new Error(
                "Event type creation is not supported via API. Please use the Calendly dashboard."
              );
            },

            updateEventType: async () => {
              throw new Error(
                "Event type updates are not supported via API. Please use the Calendly dashboard."
              );
            },
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
