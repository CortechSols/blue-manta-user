import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendlyService } from '../lib/calendly-service';
import type {
  CalendlyEventsResponse,
  CalendlyMeetingsResponse,
  CalendlyEventTypesResponse,
  CalendlyAvailabilityResponse,
  CalendlyAvailableSlotsResponse,
  ConnectionStatus,
  CancelMeetingRequest,
  AvailableTimesRequest,
  MeetingFilters,
} from '../types/calendly';
import { format, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';

// Query Keys
export const calendlyQueryKeys = {
  all: ['calendly'] as const,
  connection: () => [...calendlyQueryKeys.all, 'connection'] as const,
  events: () => [...calendlyQueryKeys.all, 'events'] as const,
  eventsRange: (start: string, end: string) => [...calendlyQueryKeys.events(), start, end] as const,
  meetings: () => [...calendlyQueryKeys.all, 'meetings'] as const,
  meetingsFiltered: (filters: MeetingFilters) => [...calendlyQueryKeys.meetings(), filters] as const,
  eventTypes: () => [...calendlyQueryKeys.all, 'eventTypes'] as const,
  availability: () => [...calendlyQueryKeys.all, 'availability'] as const,
  availableSlots: (eventTypeUri: string, start: string, end: string) => 
    [...calendlyQueryKeys.all, 'availableSlots', eventTypeUri, start, end] as const,
  user: () => [...calendlyQueryKeys.all, 'user'] as const,
  analytics: (eventTypeUri: string, start: string, end: string) => 
    [...calendlyQueryKeys.all, 'analytics', eventTypeUri, start, end] as const,
};

// Connection Hooks
export function useCalendlyConnectionStatus() {
  return useQuery({
    queryKey: calendlyQueryKeys.connection(),
    queryFn: () => calendlyService.getConnectionStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useCalendlyConnect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) => calendlyService.connectCalendly(code),
    onSuccess: (data) => {
      // Invalidate connection status and refresh all calendly data
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.all });
      queryClient.setQueryData(calendlyQueryKeys.connection(), data);
    },
    onError: (error) => {
      console.error('Failed to connect Calendly:', error);
    },
  });
}

export function useCalendlyDisconnect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => calendlyService.disconnectCalendly(),
    onSuccess: () => {
      // Clear all calendly data and update connection status
      queryClient.removeQueries({ queryKey: calendlyQueryKeys.all });
      queryClient.setQueryData(calendlyQueryKeys.connection(), {
        is_connected: false,
        scheduling_url: undefined,
        user_name: undefined,
      });
    },
  });
}

// Events Hooks
export function useCalendlyEvents(startDate?: Date, endDate?: Date) {
  const start = startDate || startOfMonth(new Date());
  const end = endDate || endOfMonth(new Date());
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');

  return useQuery({
    queryKey: calendlyQueryKeys.eventsRange(startStr, endStr),
    queryFn: () => calendlyService.getEvents(startStr, endStr),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
}

export function useCalendlyEventsForMonth(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return useCalendlyEvents(start, end);
}

export function useCalendlyEventsForWeek(date: Date) {
  const start = subDays(date, date.getDay());
  const end = addDays(start, 6);
  return useCalendlyEvents(start, end);
}

// Meetings Hooks
export function useCalendlyMeetings(filters?: MeetingFilters) {
  const params = filters ? {
    status: filters.status,
    start_date: filters.dateRange?.start,
    end_date: filters.dateRange?.end,
  } : undefined;

  return useQuery({
    queryKey: calendlyQueryKeys.meetingsFiltered(filters || {}),
    queryFn: () => calendlyService.getMeetings(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useUpcomingMeetings() {
  return useCalendlyMeetings({
    status: 'upcoming',
    dateRange: {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    },
  });
}

export function usePastMeetings() {
  return useCalendlyMeetings({
    status: 'past',
    dateRange: {
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    },
  });
}

// Meeting Management Hooks
export function useCancelMeeting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CancelMeetingRequest) => calendlyService.cancelMeeting(request),
    onSuccess: (data, variables) => {
      // Invalidate meetings and events queries
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.meetings() });
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.events() });
      
      // Show success notification
      console.log('Meeting cancelled successfully:', data.message);
    },
    onError: (error, variables) => {
      console.error('Failed to cancel meeting:', error);
    },
  });
}

export function useRescheduleMeeting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      meetingUri,
      newStartTime,
      newEndTime,
      reason,
    }: {
      meetingUri: string;
      newStartTime: string;
      newEndTime: string;
      reason?: string;
    }) => calendlyService.rescheduleMeeting(meetingUri, newStartTime, newEndTime, reason),
    onSuccess: (data) => {
      // Invalidate meetings and events queries
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.meetings() });
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.events() });
      
      console.log('Meeting rescheduled successfully:', data.message);
    },
    onError: (error) => {
      console.error('Failed to reschedule meeting:', error);
    },
  });
}

export function useBatchCancelMeetings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingUris, reason }: { meetingUris: string[]; reason: string }) =>
      calendlyService.batchCancelMeetings(meetingUris, reason),
    onSuccess: (results) => {
      // Invalidate meetings and events queries
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.meetings() });
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.events() });
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      console.log(`Batch cancel completed: ${successful} successful, ${failed} failed`);
    },
  });
}

// Event Types Hooks
export function useCalendlyEventTypes() {
  return useQuery({
    queryKey: calendlyQueryKeys.eventTypes(),
    queryFn: () => calendlyService.getEventTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      eventTypeUri,
      updates,
    }: {
      eventTypeUri: string;
      updates: Partial<{
        name: string;
        description: string;
        duration: number;
        active: boolean;
      }>;
    }) => calendlyService.updateEventType(eventTypeUri, updates),
    onSuccess: () => {
      // Invalidate event types query
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.eventTypes() });
    },
  });
}

// Availability Hooks
export function useCalendlyAvailability() {
  return useQuery({
    queryKey: calendlyQueryKeys.availability(),
    queryFn: () => calendlyService.getAvailability(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAvailableSlots(
  eventTypeUri: string,
  startTime: string,
  endTime: string,
  enabled = true
) {
  return useQuery({
    queryKey: calendlyQueryKeys.availableSlots(eventTypeUri, startTime, endTime),
    queryFn: () => calendlyService.getAvailableSlots({ event_type_uri: eventTypeUri, start_time: startTime, end_time: endTime }),
    enabled: enabled && !!eventTypeUri && !!startTime && !!endTime,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// User Hooks
export function useCalendlyUser() {
  return useQuery({
    queryKey: calendlyQueryKeys.user(),
    queryFn: () => calendlyService.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Analytics Hooks
export function useEventTypeAnalytics(
  eventTypeUri: string,
  startDate: string,
  endDate: string,
  enabled = true
) {
  return useQuery({
    queryKey: calendlyQueryKeys.analytics(eventTypeUri, startDate, endDate),
    queryFn: () => calendlyService.getEventTypeMetrics(eventTypeUri, startDate, endDate),
    enabled: enabled && !!eventTypeUri && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Export Hooks
export function useExportMeetings() {
  return useMutation({
    mutationFn: ({
      format,
      startDate,
      endDate,
      filters,
    }: {
      format: 'csv' | 'json';
      startDate: string;
      endDate: string;
      filters?: { status?: string; event_type?: string };
    }) => calendlyService.exportMeetings(format, startDate, endDate, filters),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meetings-${variables.startDate}-to-${variables.endDate}.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Utility Hooks
export function useCalendlyRefresh() {
  const queryClient = useQueryClient();
  
  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.all });
    },
    refreshConnection: () => {
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.connection() });
    },
    refreshEvents: () => {
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.events() });
    },
    refreshMeetings: () => {
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.meetings() });
    },
    refreshEventTypes: () => {
      queryClient.invalidateQueries({ queryKey: calendlyQueryKeys.eventTypes() });
    },
  };
}

// Combined hooks for dashboard
export function useCalendlyDashboardData(date: Date = new Date()) {
  const connectionStatus = useCalendlyConnectionStatus();
  const events = useCalendlyEventsForMonth(date);
  const upcomingMeetings = useUpcomingMeetings();
  const eventTypes = useCalendlyEventTypes();
  
  return {
    connectionStatus,
    events,
    upcomingMeetings,
    eventTypes,
    isLoading: connectionStatus.isLoading || events.isLoading || upcomingMeetings.isLoading || eventTypes.isLoading,
    isError: connectionStatus.isError || events.isError || upcomingMeetings.isError || eventTypes.isError,
    error: connectionStatus.error || events.error || upcomingMeetings.error || eventTypes.error,
  };
} 