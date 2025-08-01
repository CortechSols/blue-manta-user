import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calendlyService } from "../lib/calendly-service";
import type { MeetingFilters } from "../types/calendly";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";

// Query Keys
export const calendlyQueryKeys = {
  all: ["calendly"] as const,
  connection: () => [...calendlyQueryKeys.all, "connection"] as const,
  events: () => [...calendlyQueryKeys.all, "events"] as const,
  eventsRange: (start: string, end: string) =>
    [...calendlyQueryKeys.events(), start, end] as const,
  meetings: () => [...calendlyQueryKeys.all, "meetings"] as const,
  meetingsFiltered: (filters: MeetingFilters) =>
    [...calendlyQueryKeys.meetings(), filters] as const,
  eventTypes: () => [...calendlyQueryKeys.all, "eventTypes"] as const,
  availability: () => [...calendlyQueryKeys.all, "availability"] as const,
  availableSlots: (eventTypeUri: string, start: string, end: string) =>
    [
      ...calendlyQueryKeys.all,
      "availableSlots",
      eventTypeUri,
      start,
      end,
    ] as const,
  user: () => [...calendlyQueryKeys.all, "user"] as const,
  analytics: (eventTypeUri: string, start: string, end: string) =>
    [...calendlyQueryKeys.all, "analytics", eventTypeUri, start, end] as const,
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
      console.error("Failed to connect Calendly:", error);
    },
  });
}

// Events Hooks
export function useCalendlyEvents(startDate?: Date, endDate?: Date) {
  const start = startDate || startOfMonth(new Date());
  const end = endDate || endOfMonth(new Date());
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

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

export function useCalendlyMeetings(filters?: MeetingFilters) {
  const params = filters
    ? {
        status: filters.status,
        start_date: filters.dateRange?.start,
        end_date: filters.dateRange?.end,
      }
    : undefined;

  return useQuery({
    queryKey: calendlyQueryKeys.meetingsFiltered(filters || {}),
    queryFn: () => calendlyService.getMeetings(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useUpcomingMeetings() {
  return useCalendlyMeetings({
    status: "upcoming",
    dateRange: {
      start: format(new Date(), "yyyy-MM-dd"),
      end: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    },
  });
}

export function useCalendlyEventTypes() {
  return useQuery({
    queryKey: calendlyQueryKeys.eventTypes(),
    queryFn: () => calendlyService.getEventTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCalendlyAvailability() {
  return useQuery({
    queryKey: calendlyQueryKeys.availability(),
    queryFn: () => calendlyService.getAvailability(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}