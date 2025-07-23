import type { StateCreator } from "zustand";
import type { CalendlyStore, EventTypeActions } from "../types";

/**
 * Event type management actions for Calendly store
 */
export const createEventTypeActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore["actions"], keyof EventTypeActions> }
> = () => ({
  actions: {
    // Note: loadEventTypes is handled in dataActions.ts to avoid duplication
    // Event type creation/modification not supported by Calendly API v2
    // Users must use the Calendly dashboard for these operations
  },
});
