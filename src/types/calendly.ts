// Calendly API Types and Interfaces

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: "active" | "cancelled";
  start_time: string;
  startTime?: string;
  end_time: string;
  event_type: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  event_memberships?: unknown[];
  calendar_event?: {
    external_id: string;
    kind: string;
  };
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  cancel_url?: string;
  reschedule_url?: string;
  text_reminder_number?: string;
  timezone?: string;
  tracking?: {
    utm_campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_content?: string;
    utm_term?: string;
    salesforce_uuid?: string;
  };
  questions_and_answers?: Array<{
    question: string;
    answer: string;
  }>;
  payment?: {
    external_id: string;
    provider: string;
    amount: number;
    currency: string;
    terms: string;
    successful: boolean;
  };
}

export interface CalendlyMeeting extends CalendlyEvent {
  invitees: CalendlyInvitee[];
}

export interface EventType {
  uri: string;
  name: string;
  description?: string;
  duration: number; // minutes
  kind: string;
  slug: string;
  color: string;
  active: boolean;
  scheduling_url: string;
  booking_method?: string;
  internal_note?: string;
  type?: "StandardEventType" | "GroupEventType";
  secret?: boolean;
  pooling_type?: string;
  custom_questions?: Array<{
    name: string;
    type: string;
    position: number;
    enabled: boolean;
    required: boolean;
    answer_choices?: string[];
    include_other?: boolean;
  }>;
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  status: "available";
  date: string;
  time_slot: string;
  duration_minutes: number;
}

export interface AvailabilityRule {
  type: string;
  wday?: string;
  date?: string;
  interval: {
    from: string;
    to: string;
  };
}

export interface AvailabilitySchedule {
  uri: string;
  name: string;
  timezone: string;
  rules: AvailabilityRule[];
}

export interface ConnectionStatus {
  is_connected: boolean;
  scheduling_url?: string;
  user_name?: string;
  integration?: {
    id: number;
    organization: number;
    provider: string;
    connected_at: string;
    expires_at: string;
    is_active: boolean;
    config_blob: unknown;
  };
}

// API Request/Response Types
export interface CalendlyEventsByDate {
  date: string;
  has_events: boolean;
  events: CalendlyEvent[];
}

export interface CalendlyEventsResponse {
  events_by_date: CalendlyEventsByDate[] | Record<string, CalendlyEvent[]>; // Support both formats
  metadata: {
    total_events?: number;
    total_count?: number;
    date_range: {
      start_date: string;
      end_date: string;
    };
    connected_user?: {
      name: string;
      uri: string;
      scheduling_url: string;
    };
  };
}

export interface CalendlyMeetingsResponse {
  meetings: CalendlyMeeting[];
  total_count: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface CalendlyEventTypesResponse {
  event_types: EventType[];
  total_count: number;
}

export interface CalendlyAvailabilityResponse {
  schedules: AvailabilitySchedule[];
}

export interface CalendlyAvailableSlotsResponse {
  available_slots: AvailableSlot[];
  slots_by_date: Record<string, AvailableSlot[]>;
  event_type: EventType;
}

// Request Types
export interface CancelMeetingRequest {
  meeting_uri: string;
  reason: string;
  reschedule?: boolean;
  new_start_time?: string;
  new_end_time?: string;
}

export interface AvailableTimesRequest {
  event_type_uri: string;
  start_time: string;
  end_time: string;
}

// Calendar View Types
export interface CalendarViewEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    type: "available" | "busy" | "meeting";
    event: CalendlyEvent | CalendlyMeeting;
    status: string;
  };
  allDay?: boolean;
  color?: string;
}

// UI State Types
export interface CalendlyState {
  connectionStatus: ConnectionStatus | null;
  events: CalendlyEvent[];
  meetings: CalendlyMeeting[];
  eventTypes: EventType[];
  availabilitySchedules: AvailabilitySchedule[];
  loading: {
    events: boolean;
    meetings: boolean;
    eventTypes: boolean;
    availability: boolean;
    connection: boolean;
  };
  error: string | null;
}

// Filter Types
export interface MeetingFilters {
  status?: "upcoming" | "past" | "cancelled" | "all";
  eventType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface CalendarViewType {
  view: "month" | "week" | "day" | "agenda";
  date: Date;
}

// Booking Types
export interface BookingFormData {
  name: string;
  email: string;
  timezone?: string;
  additional_notes?: string;
  questions_and_answers?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BookingRequest {
  event_type_uri: string;
  start_time: string;
  end_time: string;
  invitee: BookingFormData;
}

export interface EventTypeFormData {
  name: string;
  description: string;
  duration: number;
  days_available?: number;
}

export interface EventTypeFormDataExtended {
  name: string;
  description: string;
  duration: number;
  kind: "solo" | "group";
  color: string;
  active: boolean;
  booking_method: "instant" | "confirmation_required";
  location_type: "ask_invitee" | "phone" | "video" | "in_person" | "custom";
  location_details?: string;
  buffer_time_before?: number;
  buffer_time_after?: number;
  minimum_notice?: number;
  maximum_notice?: number;
  days_available?: number;
}

export type CalendlyInlineWidgetOptions = {
  url: string;
  parentElement: HTMLElement | null;
  prefill?: {
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    customAnswers?: Record<string, string>;
    guests?: string[];
  };
  utm?: {
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    utmContent?: string;
    utmTerm?: string;
  };
};

export type CalendlyEventPayload = {
  event: {
    uri: string;
  };
  invitee: {
    uri: string;
  };
};
