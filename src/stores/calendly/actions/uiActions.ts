import type { StateCreator } from 'zustand';
import type { CalendlyStore, UIActions, ModalActions, UtilityActions } from '../types';
import type { CalendarViewType, MeetingFilters, CalendlyMeeting, EventType, CalendlyState } from '../../../types/calendly';

/**
 * UI management actions for Calendly store
 */
export const createUIActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore['actions'], keyof UIActions> }
> = (set, get) => ({
  actions: {
    setSelectedDate: (date) =>
      set((state) => {
        state.selectedDate = date;
        state.calendarView.date = date;
      }),

    setCalendarView: (view) =>
      set((state) => {
        state.calendarView = view;
      }),

    setMeetingFilters: (filters) =>
      set((state) => {
        state.meetingFilters = filters;
      }),

    toggleMeetingSelection: (meetingUri) =>
      set((state) => {
        const index = state.selectedMeetings.indexOf(meetingUri);
        if (index > -1) {
          state.selectedMeetings.splice(index, 1);
        } else {
          state.selectedMeetings.push(meetingUri);
        }
      }),

    selectAllMeetings: () =>
      set((state) => {
        state.selectedMeetings = state.meetings.map(m => m.uri);
      }),

    clearMeetingSelection: () =>
      set((state) => {
        state.selectedMeetings = [];
      }),
  },
});

/**
 * Modal management actions for Calendly store
 */
export const createModalActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore['actions'], keyof ModalActions> }
> = (set, get) => ({
  actions: {
    openCancelMeetingModal: (meetingUri) =>
      set((state) => {
        state.modals.cancelMeeting = {
          isOpen: true,
          meetingUri,
        };
      }),

    closeCancelMeetingModal: () =>
      set((state) => {
        state.modals.cancelMeeting = {
          isOpen: false,
          meetingUri: null,
        };
      }),

    openRescheduleMeetingModal: (meetingUri) =>
      set((state) => {
        state.modals.rescheduleMeeting = {
          isOpen: true,
          meetingUri,
        };
      }),

    closeRescheduleMeetingModal: () =>
      set((state) => {
        state.modals.rescheduleMeeting = {
          isOpen: false,
          meetingUri: null,
        };
      }),

    openMeetingDetailsModal: (meeting) =>
      set((state) => {
        state.modals.meetingDetails = {
          isOpen: true,
          meeting,
        };
      }),

    closeMeetingDetailsModal: () =>
      set((state) => {
        state.modals.meetingDetails = {
          isOpen: false,
          meeting: null,
        };
      }),

    openEventTypeDetailsModal: (eventType) =>
      set((state) => {
        state.modals.eventTypeDetails = {
          isOpen: true,
          eventType,
        };
      }),

    closeEventTypeDetailsModal: () =>
      set((state) => {
        state.modals.eventTypeDetails = {
          isOpen: false,
          eventType: null,
        };
      }),

    openAvailabilityEditor: () =>
      set((state) => {
        state.modals.availabilityEditor.isOpen = true;
      }),

    closeAvailabilityEditor: () =>
      set((state) => {
        state.modals.availabilityEditor.isOpen = false;
      }),

    openBookingForm: (eventTypeUri) =>
      set((state) => {
        state.modals.bookingForm = {
          isOpen: true,
          eventTypeUri,
        };
      }),

    closeBookingForm: () =>
      set((state) => {
        state.modals.bookingForm = {
          isOpen: false,
          eventTypeUri: null,
        };
      }),
  },
});

/**
 * Utility actions for Calendly store
 */
export const createUtilityActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore['actions'], keyof UtilityActions> }
> = (set, get) => ({
  actions: {
    setError: (error) =>
      set((state) => {
        state.error = error;
      }),

    clearError: () =>
      set((state) => {
        state.error = null;
      }),

    setLoading: (key, value) =>
      set((state) => {
        state.loading[key] = value;
      }),
  },
}); 