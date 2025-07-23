import type { CalendlyStore } from './types';

/**
 * Initial state configuration for Calendly store
 */
export const createInitialState = (): Omit<CalendlyStore, 'actions'> => ({
  // Core Calendly State
  connectionStatus: null,
  events: [],
  meetings: [],
  eventTypes: [],
  availabilitySchedules: [],
  loading: {
    events: false,
    meetings: false,
    eventTypes: false,
    availability: false,
    connection: false,
  },
  error: null,

  // UI State
  selectedDate: new Date(),
  calendarView: {
    view: 'month',
    date: new Date(),
  },
  meetingFilters: {
    status: 'all',
  },
  selectedMeetings: [],

  // Modals
  modals: {
    cancelMeeting: {
      isOpen: false,
      meetingUri: null,
    },
    rescheduleMeeting: {
      isOpen: false,
      meetingUri: null,
    },
    meetingDetails: {
      isOpen: false,
      meeting: null,
    },
    eventTypeDetails: {
      isOpen: false,
      eventType: null,
    },
    availabilityEditor: {
      isOpen: false,
    },
    bookingForm: {
      isOpen: false,
      eventTypeUri: null,
    },
  },
});

/**
 * Persistence configuration for Zustand
 */
export const createPersistConfig = () => ({
  name: 'calendly-store',
  partialize: (state: CalendlyStore) => ({
    // Only persist UI state, not data
    selectedDate: state.selectedDate,
    calendarView: state.calendarView,
    meetingFilters: state.meetingFilters,
  }),
}); 