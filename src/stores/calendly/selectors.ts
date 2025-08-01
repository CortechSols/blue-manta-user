import { type CalendlyStore } from "./types";

/**
 * Individual selector hooks for better performance and preventing unnecessary re-renders
 */

// Core data selectors
export const useCalendlyConnection = (state: CalendlyStore) =>
  state.connectionStatus;
export const useCalendlyEvents = (state: CalendlyStore) => state.events;
export const useCalendlyMeetings = (state: CalendlyStore) => state.meetings;
export const useCalendlyEventTypes = (state: CalendlyStore) => state.eventTypes;
export const useCalendlyAvailability = (state: CalendlyStore) =>
  state.availabilitySchedules;

// Loading and error selectors
export const useCalendlyLoading = (state: CalendlyStore) => state.loading;
export const useCalendlyError = (state: CalendlyStore) => state.error;

// UI selectors
export const useCalendlySelectedDate = (state: CalendlyStore) =>
  state.selectedDate;
export const useCalendlyCalendarView = (state: CalendlyStore) =>
  state.calendarView;
export const useCalendlyMeetingFilters = (state: CalendlyStore) =>
  state.meetingFilters;
export const useCalendlySelectedMeetings = (state: CalendlyStore) =>
  state.selectedMeetings;
export const useCalendlyModals = (state: CalendlyStore) => state.modals;

// Action selector
export const useCalendlyActions = (state: CalendlyStore) => ({
  // Connection Actions
  connectCalendly: state.actions.connectCalendly,
  disconnectCalendly: state.actions.disconnectCalendly,
  checkConnectionStatus: state.actions.checkConnectionStatus,

  // Data Loading Actions
  loadEvents: state.actions.loadEvents,
  loadMeetings: state.actions.loadMeetings,
  loadEventTypes: state.actions.loadEventTypes,
  loadAvailability: state.actions.loadAvailability,
  refreshAll: state.actions.refreshAll,

  // Meeting Actions
  cancelMeeting: state.actions.cancelMeeting,
  batchCancelMeetings: state.actions.batchCancelMeetings,

  // UI Actions
  setCalendarView: state.actions.setCalendarView,
  setSelectedDate: state.actions.setSelectedDate,
  setMeetingFilters: state.actions.setMeetingFilters,
  toggleMeetingSelection: state.actions.toggleMeetingSelection,
  selectAllMeetings: state.actions.selectAllMeetings,
  clearMeetingSelection: state.actions.clearMeetingSelection,

  // Modal Actions
  openMeetingDetailsModal: state.actions.openMeetingDetailsModal,
  openCancelMeetingModal: state.actions.openCancelMeetingModal,
  closeAllModals: state.actions.closeAllModals,

  // Error Management
  clearError: state.actions.clearError,
});

// Combined selectors for common use cases
export const useCalendlyDashboard = (state: CalendlyStore) => ({
  connectionStatus: state.connectionStatus,
  events: state.events,
  meetings: state.meetings,
  eventTypes: state.eventTypes,
  loading: state.loading,
  error: state.error,
});
