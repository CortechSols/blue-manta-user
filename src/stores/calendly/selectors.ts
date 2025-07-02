import { useCalendlyStore } from './store';

/**
 * Individual selector hooks for better performance and preventing unnecessary re-renders
 */

// Core data selectors
export const useCalendlyConnection = () => useCalendlyStore((state) => state.connectionStatus);
export const useCalendlyEvents = () => useCalendlyStore((state) => state.events);
export const useCalendlyMeetings = () => useCalendlyStore((state) => state.meetings);
export const useCalendlyEventTypes = () => useCalendlyStore((state) => state.eventTypes);
export const useCalendlyAvailability = () => useCalendlyStore((state) => state.availabilitySchedules);

// Loading and error selectors
export const useCalendlyLoading = () => useCalendlyStore((state) => state.loading);
export const useCalendlyError = () => useCalendlyStore((state) => state.error);

// UI selectors
export const useCalendlySelectedDate = () => useCalendlyStore((state) => state.selectedDate);
export const useCalendlyCalendarView = () => useCalendlyStore((state) => state.calendarView);
export const useCalendlyMeetingFilters = () => useCalendlyStore((state) => state.meetingFilters);
export const useCalendlySelectedMeetings = () => useCalendlyStore((state) => state.selectedMeetings);
export const useCalendlyModals = () => useCalendlyStore((state) => state.modals);

// Action selectors
export const useCalendlyActions = () => useCalendlyStore((state) => state.actions);

// Specific action group selectors for better organization
export const useCalendlyConnectionActions = () => useCalendlyStore((state) => ({
  setConnectionStatus: state.actions.setConnectionStatus,
  checkConnectionStatus: state.actions.checkConnectionStatus,
  connectCalendly: state.actions.connectCalendly,
  disconnectCalendly: state.actions.disconnectCalendly,
}));

export const useCalendlyDataActions = () => useCalendlyStore((state) => ({
  loadEvents: state.actions.loadEvents,
  loadMeetings: state.actions.loadMeetings,
  loadEventTypes: state.actions.loadEventTypes,
  loadAvailability: state.actions.loadAvailability,
  refreshAll: state.actions.refreshAll,
}));

export const useCalendlyMeetingActions = () => useCalendlyStore((state) => ({
  cancelMeeting: state.actions.cancelMeeting,
  rescheduleMeeting: state.actions.rescheduleMeeting,
  batchCancelMeetings: state.actions.batchCancelMeetings,
}));

export const useCalendlyEventTypeActions = () => useCalendlyStore((state) => ({
  createEventType: state.actions.createEventType,
  updateEventType: state.actions.updateEventType,
}));

export const useCalendlyUIActions = () => useCalendlyStore((state) => ({
  setSelectedDate: state.actions.setSelectedDate,
  setCalendarView: state.actions.setCalendarView,
  setMeetingFilters: state.actions.setMeetingFilters,
  toggleMeetingSelection: state.actions.toggleMeetingSelection,
  selectAllMeetings: state.actions.selectAllMeetings,
  clearMeetingSelection: state.actions.clearMeetingSelection,
}));

export const useCalendlyModalActions = () => useCalendlyStore((state) => ({
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

export const useCalendlyUtilityActions = () => useCalendlyStore((state) => ({
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