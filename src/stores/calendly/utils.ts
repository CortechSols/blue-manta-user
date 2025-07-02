import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import type { CalendlyEvent, CalendlyMeeting } from '../../types/calendly';

/**
 * Utility functions for Calendly store operations
 */

/**
 * Safely extracts events from API response
 */
export const extractEventsFromResponse = (response: any): CalendlyEvent[] => {
  if (!response) return [];

  // Handle new array format
  if (response.events_by_date && Array.isArray(response.events_by_date)) {
    return response.events_by_date
      .filter((dateEntry: any) => dateEntry.has_events && Array.isArray(dateEntry.events))
      .flatMap((dateEntry: any) => dateEntry.events);
  }

  // Handle old object format
  if (response.events_by_date && typeof response.events_by_date === 'object') {
    return Object.values(response.events_by_date).flat() as CalendlyEvent[];
  }

  // Handle direct events array
  if (Array.isArray(response.events)) {
    return response.events;
  }

  // Handle direct array response
  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

/**
 * Safely extracts meetings from API response
 */
export const extractMeetingsFromResponse = (response: any): CalendlyMeeting[] => {
  if (!response) return [];

  if (Array.isArray(response.meetings)) {
    return response.meetings;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

/**
 * Converts events with active invitees to meetings
 */
export const separateEventsAndMeetings = (events: CalendlyEvent[]): {
  events: CalendlyEvent[];
  meetings: CalendlyMeeting[];
} => {
  const actualEvents: CalendlyEvent[] = [];
  const actualMeetings: CalendlyMeeting[] = [];

  events.forEach((event) => {
    // If the event has active invitees, treat it as a meeting
    if (event.invitees_counter && event.invitees_counter.active > 0) {
      // Convert to meeting format by adding invitees array
      const meeting: CalendlyMeeting = {
        ...event,
        invitees: event.event_memberships?.map((membership: any) => ({
          uri: `invitee-${membership.user}`,
          email: membership.user_email,
          name: membership.user_name,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) || []
      };
      actualMeetings.push(meeting);
    } else {
      actualEvents.push(event);
    }
  });

  return { events: actualEvents, meetings: actualMeetings };
};

/**
 * Gets date range for loading events
 */
export const getEventDateRange = (selectedDate: Date, startDate?: Date, endDate?: Date) => {
  const start = startDate || startOfMonth(selectedDate);
  const end = endDate || endOfMonth(selectedDate);
  return { start, end };
};

/**
 * Gets extended date range for refresh operations
 */
export const getExtendedDateRange = () => {
  const now = new Date();
  const sixMonthsFromNow = addMonths(now, 6);
  return { start: now, end: sixMonthsFromNow };
};

/**
 * Formats date for API requests
 */
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Creates a new event type object for the store
 */
export const createEventTypeForStore = (response: any): any => {
  return {
    uri: response.uri,
    name: response.name,
    description: response.description,
    duration: response.duration,
    kind: response.kind,
    scheduling_url: response.scheduling_url,
    active: true,
    color: '#0069ff',
    slug: response.uri.split('/').pop() || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

/**
 * Handles navigation to first meeting date if needed
 */
export const shouldNavigateToMeetingDate = (
  meetings: CalendlyMeeting[],
  currentSelectedDate: Date
): Date | null => {
  if (meetings.length === 0) return null;

  const firstMeeting = meetings[0];
  if (!firstMeeting?.start_time) return null;

  const firstMeetingDate = new Date(firstMeeting.start_time);
  const currentMonth = startOfMonth(currentSelectedDate);
  const firstMeetingMonth = startOfMonth(firstMeetingDate);

  // If the first meeting is in a different month, return the meeting date
  if (currentMonth.getTime() !== firstMeetingMonth.getTime()) {
    return firstMeetingDate;
  }

  return null;
};

/**
 * Normalizes event type data to match the expected interface format
 */
const normalizeEventType = (eventType: any): any => {
  return {
    uri: eventType.uri,
    name: eventType.name,
    description: eventType.description,
    duration: eventType.duration,
    kind: eventType.kind,
    slug: eventType.slug,
    color: eventType.color,
    active: eventType.active,
    // Handle both camelCase and snake_case
    scheduling_url: eventType.schedulingUrl || eventType.scheduling_url,
    internal_note: eventType.internalNote || eventType.internal_note,
    profile: eventType.profile,
  };
};

/**
 * Safely extracts event types from API response
 */
export const extractEventTypesFromResponse = (response: any): any[] => {
  if (!response) return [];

  let eventTypes: any[] = [];

  // Handle camelCase format (eventTypes)
  if (Array.isArray(response.eventTypes)) {
    eventTypes = response.eventTypes;
  }
  // Handle snake_case format (event_types) - for backward compatibility
  else if (Array.isArray(response.event_types)) {
    eventTypes = response.event_types;
  }
  // Handle direct array response
  else if (Array.isArray(response)) {
    eventTypes = response;
  }

  // Normalize all event types to match the expected interface format
  return eventTypes.map(normalizeEventType);
};

/**
 * Safely extracts availability schedules from API response
 */
export const extractAvailabilityFromResponse = (response: any): any[] => {
  if (!response) return [];

  if (Array.isArray(response.schedules)) {
    return response.schedules;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

/**
 * Creates error message with context
 */
export const createErrorMessage = (operation: string, error: unknown): string => {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  return `Failed to ${operation}: ${message}`;
};

/**
 * Processes batch operation results
 */
export const processBatchResults = (results: Array<{ success: boolean; error?: string }>) => {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  return {
    successful,
    failed,
    hasErrors: failed > 0,
    message: failed > 0 ? `Batch operation completed: ${successful} successful, ${failed} failed` : null
  };
}; 