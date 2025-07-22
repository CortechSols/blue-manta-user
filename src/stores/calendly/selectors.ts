import { useCalendlyStore } from "./store";
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

// Action selectors
export const useCalendlyActions = (state: CalendlyStore) => ({
  // Connection Actions
  connectCalendly: state.actions.connectCalendly,
  disconnectCalendly: state.actions.disconnectCalendly,
  checkConnection: state.actions.checkConnection,

  // Data Loading Actions (Read Only)
  loadEvents: state.actions.loadEvents,
  loadMeetings: state.actions.loadMeetings,
  loadEventTypes: state.actions.loadEventTypes,
  loadAvailability: state.actions.loadAvailability,
  refreshAll: state.actions.refreshAll,

  // Meeting Actions (Limited)
  cancelMeeting: state.actions.cancelMeeting,

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
  openEventTypeDetailsModal: state.actions.openEventTypeDetailsModal,
  closeAllModals: state.actions.closeAllModals,

  // Error Management
  clearError: state.actions.clearError,

  // Note: Removed unsupported actions:
  // - createEventType (not supported by API)
  // - updateEventType (not supported by API)
  // - openRescheduleMeetingModal (use reschedule URLs instead)
});

// Specific action group selectors for better organization
export const useCalendlyConnectionActions = () =>
  useCalendlyStore((state) => ({
    setConnectionStatus: state.actions.setConnectionStatus,
    checkConnectionStatus: state.actions.checkConnectionStatus,
    connectCalendly: state.actions.connectCalendly,
    disconnectCalendly: state.actions.disconnectCalendly,
  }));

export const useCalendlyDataActions = () =>
  useCalendlyStore((state) => ({
    loadEvents: state.actions.loadEvents,
    loadMeetings: state.actions.loadMeetings,
    loadEventTypes: state.actions.loadEventTypes,
    loadAvailability: state.actions.loadAvailability,
    refreshAll: state.actions.refreshAll,
  }));

export const useCalendlyMeetingActions = () =>
  useCalendlyStore((state) => ({
    cancelMeeting: state.actions.cancelMeeting,
    rescheduleMeeting: state.actions.rescheduleMeeting,
    batchCancelMeetings: state.actions.batchCancelMeetings,
  }));

export const useCalendlyEventTypeActions = () =>
  useCalendlyStore((state) => ({
    createEventType: state.actions.createEventType,
    updateEventType: state.actions.updateEventType,
  }));

export const useCalendlyUIActions = () =>
  useCalendlyStore((state) => ({
    setSelectedDate: state.actions.setSelectedDate,
    setCalendarView: state.actions.setCalendarView,
    setMeetingFilters: state.actions.setMeetingFilters,
    toggleMeetingSelection: state.actions.toggleMeetingSelection,
    selectAllMeetings: state.actions.selectAllMeetings,
    clearMeetingSelection: state.actions.clearMeetingSelection,
  }));

export const useCalendlyModalActions = () =>
  useCalendlyStore((state) => ({
    openCancelMeetingModal: state.actions.openCancelMeetingModal,
    closeCancelMeetingModal: state.actions.closeCancelMeetingModal,
    openRescheduleMeetingModal: state.actions.openRescheduleMeetingModal,
    closeRescheduleMeetingModal: state.actions.closeRescheduleMeetingModal,
    openMeetingDetailsModal: state.actions.openMeetingDetailsModal,
    closeMeetingDetailsModal: state.actions.closeMeetingDetailsModal,
    openEventTypeDetailsModal: state.actions.openEventTypeDetailsModal,
    closeEventTypeDetailsModal: state.actions.closeEventTypeDetailsModal,
    openAvailabilityEditor: state.actions.openAvailabilityEditor,
    closeAvailabilityEditor: state.actions.closeAvailabilityEditor,
    openBookingForm: state.actions.openBookingForm,
    closeBookingForm: state.actions.closeBookingForm,
  }));

export const useCalendlyUtilityActions = () =>
  useCalendlyStore((state) => ({
    setError: state.actions.setError,
    clearError: state.actions.clearError,
    setLoading: state.actions.setLoading,
  }));

/**
 * Combined selectors with proper memoization for common use cases
 */
export const useCalendlyUI = () => {
  const selectedDate = useCalendlySelectedDate();
  const calendarView = useCalendlyCalendarView();
  const meetingFilters = useCalendlyMeetingFilters();
  const selectedMeetings = useCalendlySelectedMeetings();
  const modals = useCalendlyModals();

  return {
    selectedDate,
    calendarView,
    meetingFilters,
    selectedMeetings,
    modals,
  };
};

export const useCalendlyDashboard = (state: CalendlyStore) => ({
  connectionStatus: state.connectionStatus,
  events: state.events,
  meetings: state.meetings,
  eventTypes: state.eventTypes,
  loading: state.loading,
  error: state.error,
});

export const useCalendlyData = () => {
  const events = useCalendlyEvents();
  const meetings = useCalendlyMeetings();
  const eventTypes = useCalendlyEventTypes();
  const availabilitySchedules = useCalendlyAvailability();

  return {
    events,
    meetings,
    eventTypes,
    availabilitySchedules,
  };
};

export const useCalendlyStatus = () => {
  const connectionStatus = useCalendlyConnection();
  const loading = useCalendlyLoading();
  const error = useCalendlyError();

  return {
    connectionStatus,
    loading,
    error,
    isConnected: connectionStatus?.is_connected ?? false,
    isLoading: Object.values(loading).some(Boolean),
    hasError: !!error,
  };
};
