import type {
  CalendlyMeeting,
  EventType,
  ConnectionStatus,
  MeetingFilters,
  CalendarViewType,
  CalendlyState,
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
  meetingDetails: {
    isOpen: boolean;
    meeting: CalendlyMeeting | null;
  };
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
  batchCancelMeetings: (meetingUris: string[], reason: string) => Promise<BatchCancelResult[]>;
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
  openMeetingDetailsModal: (meeting: CalendlyMeeting) => void;
  closeMeetingDetailsModal: () => void;
  closeAllModals: () => void;
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
  UIActions,
  ModalActions,
  UtilityActions {
  checkConnection: () => Promise<void>;
}

export interface CalendlyStore extends CalendlyState, CalendlyUIState {
  modals: CalendlyModals;
  actions: CalendlyActions;
} 