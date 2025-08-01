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

    closeAllModals: () =>
      set(() => ({
        modals: {
          cancelMeeting: {
            isOpen: false,
            meetingUri: null,
          },
          meetingDetails: {
            isOpen: false,
            meeting: null,
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
          meetingDetails: {
            isOpen: false,
            meeting: null,
          },
        },
      })),
  },
});
