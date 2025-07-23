import type { StateCreator } from 'zustand';
import type { CalendlyStore, DataLoadingActions } from '../types';
import { calendlyService } from '../../../lib/calendly-service';
import {
  extractEventsFromResponse,
  extractMeetingsFromResponse,
  extractEventTypesFromResponse,
  extractAvailabilityFromResponse,
  separateEventsAndMeetings,
  getEventDateRange,
  getExtendedDateRange,
  formatDateForAPI,
  shouldNavigateToMeetingDate,
  createErrorMessage,
} from '../utils';

/**
 * Data loading actions for Calendly store
 */
export const createDataActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore['actions'], keyof DataLoadingActions> }
> = (set, get) => ({
  actions: {
    loadEvents: async (startDate, endDate) => {
      const { start, end } = getEventDateRange(get().selectedDate, startDate, endDate);

      console.log('Loading events for date range:', {
        start: formatDateForAPI(start),
        end: formatDateForAPI(end),
        selectedDate: get().selectedDate
      });

      set((state) => {
        state.loading.events = true;
        state.error = null;
        return state;
      });

      try {
        const response = await calendlyService.getEvents(
          formatDateForAPI(start),
          formatDateForAPI(end)
        );

        console.log('Events response:', response);

        set((state) => {
          const extractedEvents = extractEventsFromResponse(response);
          const { events: actualEvents, meetings: actualMeetings } = separateEventsAndMeetings(extractedEvents);

          console.log('Final processing result:', {
            actualEvents: actualEvents.length,
            actualMeetings: actualMeetings.length
          });

          state.events = actualEvents;
          
          // Also update meetings if we found any
          if (actualMeetings.length > 0) {
            state.meetings = [...state.meetings, ...actualMeetings];

            // Navigate to first meeting date if needed
            const newDate = shouldNavigateToMeetingDate(actualMeetings, state.selectedDate);
            if (newDate) {
              console.log('Navigating to first meeting date:', newDate);
              state.selectedDate = newDate;
              state.calendarView.date = newDate;
            }
          }

          state.loading.events = false;
          return state;
        });
      } catch (error) {
        console.error('Failed to load events:', error);
        set((state) => {
          state.error = createErrorMessage('load events', error);
          state.loading.events = false;
          state.events = [];
          return state;
        });
      }
    },

    loadMeetings: async (filters) => {
      set((state) => {
        state.loading.meetings = true;
        state.error = null;
        return state;
      });

      try {
        const params = filters ? {
          status: filters.status,
          start_date: filters.dateRange?.start,
          end_date: filters.dateRange?.end,
        } : undefined;

        const response = await calendlyService.getMeetings(params);

        console.log('Meetings response:', response);

        set((state) => {
          const extractedMeetings = extractMeetingsFromResponse(response);
          console.log('Raw meetings from API:', extractedMeetings);
          state.meetings = extractedMeetings;
          state.loading.meetings = false;
          return state;
        });
      } catch (error) {
        console.error('Failed to load meetings:', error);
        set((state) => {
          state.error = createErrorMessage('load meetings', error);
          state.loading.meetings = false;
          state.meetings = [];
          return state;
        });
      }
    },

    loadEventTypes: async () => {
      set(() => ({
        loading: {
          ...get().loading,
          eventTypes: true,
        },
        error: null,
      }));

      try {
        const response = await calendlyService.getEventTypes();

        console.log('Event types response:', response);

        set((state) => {
          const extractedEventTypes = extractEventTypesFromResponse(response);
          console.log('Extracted event types:', extractedEventTypes);
          state.eventTypes = extractedEventTypes;
          state.loading.eventTypes = false;
          return state;
        });
      } catch (error) {
        console.error('Failed to load event types:', error);
        set((state) => {
          state.error = createErrorMessage('load event types', error);
          state.loading.eventTypes = false;
          state.eventTypes = [];
          return state;
        });
      }
    },

    loadAvailability: async () => {
      set((state) => {
        state.loading.availability = true;
        state.error = null;
        return state;
      });

      try {
        const response = await calendlyService.getAvailability();

        console.log('Availability response:', response);

        set((state) => {
          const extractedAvailability = extractAvailabilityFromResponse(response);
          state.availabilitySchedules = extractedAvailability;
          state.loading.availability = false;
          return state;
        });
      } catch (error) {
        console.error('Failed to load availability:', error);
        set((state) => {
          state.error = createErrorMessage('load availability', error);
          state.loading.availability = false;
          state.availabilitySchedules = [];
          return state;
        });
      }
    },

    refreshAll: async () => {
      const actions = get().actions;
      const { start, end } = getExtendedDateRange();

      await Promise.all([
        actions.loadEvents(start, end), // Load next 6 months
        actions.loadMeetings(),
        actions.loadEventTypes(),
        actions.loadAvailability(),
      ]);
    },
  },
}); 