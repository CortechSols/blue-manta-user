import type {
  CalendlyMeeting,
  EventType,
  ConnectionStatus,
  MeetingFilters,
  CalendarViewType,
  CalendlyState,
  EventTypeFormData,
} from '../../types/calendly';

// Store-specific types
export interface CalendlyUIState {
  selectedDate: Date;
  calendarView: CalendarViewType;
  meetingFilters: MeetingFilters;
  selectedMeetings: string[];
}

export interface CalendlyModals {
  cancelMeeting: {
    isOpen: boolean;
    meetingUri: string | null;
  };
  rescheduleMeeting: {
    isOpen: boolean;
    meetingUri: string | null;
  };
  meetingDetails: {
    isOpen: boolean;
    meeting: CalendlyMeeting | null;
  };
  eventTypeDetails: {
    isOpen: boolean;
    eventType: EventType | null;
  };
  availabilityEditor: {
    isOpen: boolean;
  };
  bookingForm: {
    isOpen: boolean;
    eventTypeUri: string | null;
  };
}

export interface CreateEventTypeResponse {
  uri: string;
  name: string;
  description: string;
  duration: number;
  kind: string;
  scheduling_url: string;
  date_setting?: {
    type: string;
    start_date: string;
    end_date: string;
  };
  note?: string;
}

export interface BatchCancelResult {
  uri: string;
  success: boolean;
  error?: string;
}

// Action types for better organization
export interface ConnectionActions {
  setConnectionStatus: (status: ConnectionStatus) => void;
  checkConnectionStatus: () => Promise<void>;
  connectCalendly: (code: string) => Promise<void>;
  disconnectCalendly: () => Promise<void>;
}

export interface DataLoadingActions {
  loadEvents: (startDate?: Date, endDate?: Date) => Promise<void>;
  loadMeetings: (filters?: MeetingFilters) => Promise<void>;
  loadEventTypes: () => Promise<void>;
  loadAvailability: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export interface MeetingManagementActions {
  cancelMeeting: (meetingUri: string, reason: string) => Promise<void>;
  rescheduleMeeting: (meetingUri: string, newStartTime: string, newEndTime: string, reason?: string) => Promise<void>;
  batchCancelMeetings: (meetingUris: string[], reason: string) => Promise<BatchCancelResult[]>;
}

export interface EventTypeManagementActions {
  createEventType: (eventTypeData: EventTypeFormData) => Promise<CreateEventTypeResponse>;
  updateEventType: (eventTypeUri: string, updates: Partial<EventType>) => Promise<void>;
}

export interface UIActions {
  setSelectedDate: (date: Date) => void;
  setCalendarView: (view: CalendarViewType) => void;
  setMeetingFilters: (filters: MeetingFilters) => void;
  toggleMeetingSelection: (meetingUri: string) => void;
  selectAllMeetings: () => void;
  clearMeetingSelection: () => void;
}

export interface ModalActions {
  openCancelMeetingModal: (meetingUri: string) => void;
  closeCancelMeetingModal: () => void;
  openRescheduleMeetingModal: (meetingUri: string) => void;
  closeRescheduleMeetingModal: () => void;
  openMeetingDetailsModal: (meeting: CalendlyMeeting) => void;
  closeMeetingDetailsModal: () => void;
  openEventTypeDetailsModal: (eventType: EventType) => void;
  closeEventTypeDetailsModal: () => void;
  openAvailabilityEditor: () => void;
  closeAvailabilityEditor: () => void;
  openBookingForm: (eventTypeUri: string) => void;
  closeBookingForm: () => void;
}

export interface UtilityActions {
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (key: keyof CalendlyState['loading'], value: boolean) => void;
  clearAllData: () => void;
}

export interface CalendlyActions extends 
  ConnectionActions,
  DataLoadingActions,
  MeetingManagementActions,
  EventTypeManagementActions,
  UIActions,
  ModalActions,
  UtilityActions {
  closeAllModals: () => void;
  checkConnection: () => Promise<void>;
}

export interface CalendlyStore extends CalendlyState, CalendlyUIState {
  modals: CalendlyModals;
  actions: CalendlyActions;
}

// Event Type Actions (Read Only)
export type EventTypeActions = object

// Meeting Actions (Limited)
export interface MeetingActions {
  loadMeetings: (filters?: MeetingFilters) => Promise<void>;
  cancelMeeting: (meetingUri: string, reason: string) => Promise<void>;
  setMeetingFilters: (filters: MeetingFilters) => void;
  toggleMeetingSelection: (meetingUri: string) => void;
  selectAllMeetings: () => void;
  clearMeetingSelection: () => void;
  // Note: openRescheduleMeetingModal removed - use reschedule URLs instead
} 