/**
 * Modular Calendly Store
 * 
 * This module provides a fully refactored, modular Calendly store with:
 * - Clear separation of concerns
 * - Type safety
 * - Performance optimizations
 * - DRY principle implementation
 * - Scalable architecture
 */

import { useCalendlyStore } from './store';

// Selector exports (using the hook pattern)
export const useCalendlyConnection = () => useCalendlyStore((state) => state.connectionStatus);
export const useCalendlyEvents = () => useCalendlyStore((state) => state.events);
export const useCalendlyMeetings = () => useCalendlyStore((state) => state.meetings);
export const useCalendlyEventTypes = () => useCalendlyStore((state) => state.eventTypes);
export const useCalendlyAvailability = () => useCalendlyStore((state) => state.availabilitySchedules);
export const useCalendlyLoading = () => useCalendlyStore((state) => state.loading);
export const useCalendlyError = () => useCalendlyStore((state) => state.error);

// UI selectors
export const useCalendlySelectedDate = () => useCalendlyStore((state) => state.selectedDate);
export const useCalendlyCalendarView = () => useCalendlyStore((state) => state.calendarView);
export const useCalendlyMeetingFilters = () => useCalendlyStore((state) => state.meetingFilters);
export const useCalendlySelectedMeetings = () => useCalendlyStore((state) => state.selectedMeetings);
export const useCalendlyModals = () => useCalendlyStore((state) => state.modals);

// Individual action selectors to prevent infinite loops
export const useSetCalendarView = () => useCalendlyStore((state) => state.actions.setCalendarView);
export const useSetSelectedDate = () => useCalendlyStore((state) => state.actions.setSelectedDate);
export const useLoadEvents = () => useCalendlyStore((state) => state.actions.loadEvents);

// Action selectors (only supported operations) - cached to prevent infinite loops
export const useCalendlyActions = () => useCalendlyStore((state) => state.actions);

// Combined dashboard data - using individual selectors to prevent infinite loops
export const useCalendlyDashboard = () => {
  const connectionStatus = useCalendlyConnection();
  const events = useCalendlyEvents();
  const meetings = useCalendlyMeetings();
  const eventTypes = useCalendlyEventTypes();
  const loading = useCalendlyLoading();
  const error = useCalendlyError();

  return {
    connectionStatus,
    events,
    meetings,
    eventTypes,
    loading,
    error,
  };
};

// Type exports
export type {
  CalendlyStore,
  CalendlyState,
  CalendlyActions,
  CalendlyModals,
  MeetingFilters,
  CalendarViewType,
} from './types';

// Utility functions (if needed externally)
export {
  extractEventsFromResponse,
  extractMeetingsFromResponse,
  separateEventsAndMeetings,
  formatDateForAPI,
  createErrorMessage,
} from './utils';