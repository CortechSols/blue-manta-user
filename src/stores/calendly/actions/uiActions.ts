import type { StateCreator } from "zustand";
import type {
  CalendlyStore,
  UIActions,
  ModalActions,
  UtilityActions,
} from "../types";
import type {
  CalendarViewType,
  MeetingFilters,
  CalendlyMeeting,
} from "../../../types/calendly";

/**
 * UI management actions for Calendly store
 */
export const createUIActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore["actions"], keyof UIActions> }
> = (set) => ({
  actions: {
    setSelectedDate: (date: Date) =>
      set(() => ({
        selectedDate: date,
      })),

    setCalendarView: (view: CalendarViewType) =>
      set(() => ({
        calendarView: view,
      })),

    setMeetingFilters: (filters: MeetingFilters) =>
      set(() => ({
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

    openMeetingDetailsModal: (meeting: CalendlyMeeting) =>
      set(() => ({
        modals: {
          meetingDetails: { isOpen: true, meeting },
          cancelMeeting: { isOpen: false, meetingUri: null },
          createEventType: { isOpen: false },
          rescheduleMeeting: { isOpen: false, meetingUri: null },
          eventTypeDetails: { isOpen: false, eventType: null },
          availabilityEditor: { isOpen: false },
          bookingForm: { isOpen: false, eventTypeUri: null },
        },
      })),

    openCancelMeetingModal: (meetingUri: string) =>
      set(() => ({
        modals: {
          meetingDetails: { isOpen: false, meeting: null },
          cancelMeeting: { isOpen: true, meetingUri },
          createEventType: { isOpen: false },
          rescheduleMeeting: { isOpen: false, meetingUri: null },
          eventTypeDetails: { isOpen: false, eventType: null },
          availabilityEditor: { isOpen: false },
          bookingForm: { isOpen: false, eventTypeUri: null },
        },
      })),

    openEventTypeDetailsModal: () =>
      set(() => ({
        modals: {
          meetingDetails: { isOpen: false, meeting: null },
          cancelMeeting: { isOpen: false, meetingUri: null },
          createEventType: { isOpen: false },
          rescheduleMeeting: { isOpen: false, meetingUri: null },
          eventTypeDetails: { isOpen: false, eventType: null },
          availabilityEditor: { isOpen: false },
          bookingForm: { isOpen: false, eventTypeUri: null },
        },
      })),

    closeAllModals: () =>
      set(() => ({
        modals: {
          meetingDetails: { isOpen: false, meeting: null },
          cancelMeeting: { isOpen: false, meetingUri: null },
          createEventType: { isOpen: false },
          eventTypeDetails: { isOpen: false, eventType: null },
          rescheduleMeeting: { isOpen: false, meetingUri: null },
          availabilityEditor: { isOpen: false },
          bookingForm: { isOpen: false, eventTypeUri: null },
        },
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
  { actions: Pick<CalendlyStore["actions"], keyof ModalActions> }
> = (set) => ({
  actions: {
    openCancelMeetingModal: (meetingUri) =>
      set((state) => ({
        modals: {
          ...state.modals,
          cancelMeeting: {
            isOpen: true,
            meetingUri,
          },
        },
      })),

    closeCancelMeetingModal: () =>
      set((state) => ({
        modals: {
          ...state.modals,
          cancelMeeting: {
            isOpen: false,
            meetingUri: null,
          },
        },
      })),

    openRescheduleMeetingModal: (meetingUri) =>
      set((state) => ({
        modals: {
          ...state.modals,
          rescheduleMeeting: {
            isOpen: true,
            meetingUri,
          },
        },
      })),

    closeRescheduleMeetingModal: () =>
      set((state) => ({
        modals: {
          ...state.modals,
          rescheduleMeeting: {
            isOpen: false,
            meetingUri: null,
          },
        },
      })),

    openMeetingDetailsModal: (meeting) =>
      set((state) => ({
        modals: {
          ...state.modals,
          meetingDetails: {
            isOpen: true,
            meeting,
          },
        },
      })),

    closeMeetingDetailsModal: () =>
      set((state) => ({
        modals: {
          ...state.modals,
          meetingDetails: {
            isOpen: false,
            meeting: null,
          },
        },
      })),

    openEventTypeDetailsModal: (eventType) =>
      set((state) => ({
        modals: {
          ...state.modals,
          eventTypeDetails: {
            isOpen: true,
            eventType,
          },
        },
      })),

    closeEventTypeDetailsModal: () =>
      set((state) => ({
        modals: {
          ...state.modals,
          eventTypeDetails: {
            isOpen: false,
            eventType: null,
          },
        },
      })),

    openAvailabilityEditor: () =>
      set((state) => ({
        modals: {
          ...state.modals,
          availabilityEditor: {
            isOpen: true,
          },
        },
      })),

    closeAvailabilityEditor: () =>
      set((state) => ({
        modals: {
          ...state.modals,
          availabilityEditor: {
            isOpen: false,
          },
        },
      })),

    openBookingForm: (eventTypeUri) =>
      set((state) => ({
        modals: {
          ...state.modals,
          bookingForm: {
            isOpen: true,
            eventTypeUri,
          },
        },
      })),

    closeBookingForm: () =>
      set((state) => ({
        modals: {
          ...state.modals,
          bookingForm: {
            isOpen: false,
            eventTypeUri: null,
          },
        },
      })),
  },
});

/**
 * Utility actions for Calendly store
 */
export const createUtilityActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore["actions"], keyof UtilityActions> }
> = (set) => ({
  actions: {
    setError: (error) =>
      set(() => ({
        error,
      })),

    clearError: () =>
      set(() => ({
        error: null,
      })),

    setLoading: (key, value) =>
      set((state) => ({
        loading: {
          ...state.loading,
          [key]: value,
        },
      })),

    clearAllData: () =>
      set(() => ({
        // Reset all data to initial state
        connectionStatus: null,
        events: [],
        meetings: [],
        eventTypes: [],
        availabilitySchedules: [],
        error: null,

        // Reset loading states
        loading: {
          events: false,
          meetings: false,
          eventTypes: false,
          availability: false,
          connection: false,
        },

        // Reset UI state
        selectedDate: new Date(),
        calendarView: {
          view: "month" as const,
          date: new Date(),
        },
        meetingFilters: {
          status: "all" as const,
        },
        selectedMeetings: [],

        // Close all modals
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
      })),
  },
});
