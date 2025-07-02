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
  Pick<CalendlyStore, 'actions'>
> = (set, get) => ({
  actions: {
    setSelectedDate: (date: Date) =>
      set((state) => ({
        selectedDate: date,
      })),

    setCalendarView: (view: CalendarViewType) =>
      set((state) => ({
        calendarView: view,
      })),

    setMeetingFilters: (filters: MeetingFilters) =>
      set((state) => ({
        meetingFilters: filters,
      })),

    toggleMeetingSelection: (meetingUri: string) =>
      set((state) => {
        const isSelected = state.selectedMeetings.includes(meetingUri);
        return {
          selectedMeetings: isSelected
            ? state.selectedMeetings.filter((uri) => uri !== meetingUri)
            : [...state.selectedMeetings, meetingUri],
        };
      }),

    selectAllMeetings: () =>
      set((state) => ({
        selectedMeetings: state.meetings.map((meeting) => meeting.uri),
      })),

    clearMeetingSelection: () =>
      set(() => ({
        selectedMeetings: [],
      })),

    openMeetingDetailsModal: (meeting) =>
      set(() => ({
        modals: {
          meetingDetails: { isOpen: true, meeting },
          cancelMeeting: { isOpen: false },
          createEventType: { isOpen: false },
        },
      })),

    openCancelMeetingModal: (meetingUri) =>
      set(() => ({
        modals: {
          meetingDetails: { isOpen: false },
          cancelMeeting: { isOpen: true, meetingUri },
          createEventType: { isOpen: false },
        },
      })),

    openEventTypeDetailsModal: (eventType) =>
      set(() => ({
        modals: {
          meetingDetails: { isOpen: false },
          cancelMeeting: { isOpen: false },
          createEventType: { isOpen: false },
          eventTypeDetails: { isOpen: true, eventType },
        },
      })),

    closeAllModals: () =>
      set(() => ({
        modals: {
          meetingDetails: { isOpen: false },
          cancelMeeting: { isOpen: false },
          createEventType: { isOpen: false },
          eventTypeDetails: { isOpen: false },
        },
      })),

    clearError: () =>
      set(() => ({
        error: null,
      })),
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