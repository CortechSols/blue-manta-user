import type { StateCreator } from 'zustand';
import type { CalendlyStore, EventTypeManagementActions } from '../types';
import type { EventType } from '../../../types/calendly';
import { calendlyService } from '../../../lib/calendly-service';
import { createErrorMessage, createEventTypeForStore } from '../utils';

/**
 * Event type management actions for Calendly store
 */
export const createEventTypeActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore['actions'], keyof EventTypeManagementActions> }
> = (set, get) => ({
  actions: {
    createEventType: async (eventTypeData) => {
      try {
        const response = await calendlyService.createEventType(eventTypeData);

        // The new API returns the created event type directly
        if (response.uri) {
          // Convert the response to EventType format for the store
          const newEventType = createEventTypeForStore(response);

          // Add to event types list
          set((state) => {
            state.eventTypes.push(newEventType);
          });

          return response;
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        set((state) => {
          state.error = createErrorMessage('create event type', error);
        });
        throw error;
      }
    },

    updateEventType: async (eventTypeUri, updates) => {
      try {
        await calendlyService.updateEventType(eventTypeUri, updates);
        await get().actions.loadEventTypes();
      } catch (error) {
        set((state) => {
          state.error = createErrorMessage('update event type', error);
        });
        throw error;
      }
    },
  },
}); 