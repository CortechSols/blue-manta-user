import apiClient from "./api";
import type {
  CalendlyEventsResponse,
  CalendlyMeetingsResponse,
  CalendlyEventTypesResponse,
  CalendlyAvailabilityResponse,
  CalendlyAvailableSlotsResponse,
  ConnectionStatus,
  CancelMeetingRequest,
  AvailableTimesRequest,
} from "../types/calendly";
import type { AxiosRequestConfig } from "axios";

// Define interfaces for connection status response formats
interface CamelCaseConnectionResponse {
  isConnected: boolean;
  schedulingUrl?: string;
  userName?: string;
}

interface SnakeCaseConnectionResponse {
  is_connected: boolean;
  scheduling_url?: string;
  user_name?: string;
}

interface IntegrationConnectionResponse {
  id: number;
  organization: number;
  provider: string;
  connected_at: string;
  expires_at?: string;
  is_active: boolean;
  config_blob?: string;
}

type ConnectionStatusResponse =
  | CamelCaseConnectionResponse
  | SnakeCaseConnectionResponse
  | IntegrationConnectionResponse;

interface ConfigBlobData {
  scheduling_url?: string;
  user_name?: string;
}

export class CalendlyService {
  updateEventType(
    eventTypeUri: string,
    updates: Partial<{
      name: string;
      description: string;
      duration: number;
      active: boolean;
    }>
  ): Promise<unknown> {
    return this.makeRequest<unknown>(`/event_types/${eventTypeUri}/`, {
      method: "PATCH",
      data: updates,
    });
  }
  private baseURL: string;

  constructor() {
    this.baseURL = "/integrations/calendly";
  }

  private async makeRequest<T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await apiClient({
        url: `${this.baseURL}${endpoint}`,
        method: options.method || "GET",
        data: options.data,
        params:
          options.method === "GET"
            ? this.parseSearchParams(endpoint)
            : undefined,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`Calendly API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  private parseSearchParams(
    endpoint: string
  ): Record<string, string> | undefined {
    const url = new URL(endpoint, "http://dummy.com");
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length > 0 ? params : undefined;
  }

  // Connection Management
  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const response = await this.makeRequest<ConnectionStatusResponse>(
        "/connection_status/"
      );
      console.log("Raw connection status response:", response);
      console.log("Response type:", typeof response);
      console.log("Response keys:", Object.keys(response));

      // Handle different response formats
      if ("isConnected" in response) {
        // CamelCase format: { isConnected: true, schedulingUrl: "...", userName: "..." }
        console.log("Using camelCase format");
        return {
          is_connected: response.isConnected,
          scheduling_url: response.schedulingUrl || "",
          user_name: response.userName || "",
        };
      } else if ("is_connected" in response) {
        // Snake_case format: { is_connected: true, scheduling_url: "...", user_name: "..." }
        console.log("Using snake_case format");
        return {
          is_connected: response.is_connected,
          scheduling_url: response.scheduling_url || "",
          user_name: response.user_name || "",
        };
      } else if ("is_active" in response) {
        // Integration format: { id: 1, is_active: true, config_blob: "..." }
        console.log("Using integration format");
        let userInfo: ConfigBlobData = {};
        try {
          if (
            response.config_blob &&
            response.config_blob !== "undefined" &&
            typeof response.config_blob === "string"
          ) {
            userInfo = JSON.parse(response.config_blob) as ConfigBlobData;
          }
        } catch (e) {
          console.warn("Failed to parse config_blob:", e);
        }

        return {
          is_connected: response.is_active,
          scheduling_url: userInfo.scheduling_url || "",
          user_name: userInfo.user_name || "",
          integration: {
            id: response.id,
            organization: response.organization,
            provider: response.provider,
            connected_at: response.connected_at,
            expires_at: response.expires_at || "",
            is_active: response.is_active,
            config_blob: userInfo,
          },
        };
      } else {
        // Unknown format
        console.warn("Unknown connection status response format:", response);
        return {
          is_connected: false,
        };
      }
    } catch (error) {
      console.error("Connection status request failed:", error);
      // If we can't get connection status, we're not connected
      return {
        is_connected: false,
      };
    }
  }

  async connectCalendly(
    code: string,
    codeVerifier?: string
  ): Promise<ConnectionStatus> {
    const payload: { code: string; code_verifier?: string } = { code };
    if (codeVerifier) {
      payload.code_verifier = codeVerifier;
    }

    return this.makeRequest<ConnectionStatus>("/connect/", {
      method: "POST",
      data: payload,
    });
  }

  async disconnectCalendly(): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>("/disconnect/", {
      method: "POST",
    });
  }

  // Calendar Events (Read Only)
  async getEvents(
    startDate: string,
    endDate: string
  ): Promise<CalendlyEventsResponse> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    return this.makeRequest<CalendlyEventsResponse>(
      `/events/?${params.toString()}`
    );
  }

  async getMeetings(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    page_token?: string;
    count?: number;
  }): Promise<CalendlyMeetingsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    const queryString = searchParams.toString();
    return this.makeRequest<CalendlyMeetingsResponse>(
      `/meetings/${queryString ? `?${queryString}` : ""}`
    );
  }

  // Meeting Management (Limited)
  async cancelMeeting(
    request: CancelMeetingRequest
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      "/cancel_meeting/",
      {
        method: "POST",
        data: request,
      }
    );
  }

  // Note: Rescheduling is not supported via API - use reschedule URLs from meeting data
  async rescheduleMeeting(
    meetingUri: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      "/reschedule_meeting/",
      {
        method: "POST",
        data: {
          meeting_uri: meetingUri,
          new_start_time: newStartTime,
          new_end_time: newEndTime,
          reason,
        },
      }
    );
  }

  // Availability (Read Only)
  async getAvailability(): Promise<CalendlyAvailabilityResponse> {
    return this.makeRequest<CalendlyAvailabilityResponse>("/availability/");
  }

  async getAvailableSlots(
    request: AvailableTimesRequest
  ): Promise<CalendlyAvailableSlotsResponse> {
    return this.makeRequest<CalendlyAvailableSlotsResponse>(
      "/available_times/",
      {
        method: "POST",
        data: request,
      }
    );
  }

  // Event Types (Read Only)
  async getEventTypes(): Promise<CalendlyEventTypesResponse> {
    return this.makeRequest<CalendlyEventTypesResponse>("/event_types/");
  }

  // Note: Event type creation/modification is not supported via API
  // Users must use the Calendly dashboard for these operations

  // User Information (Read Only)
  async getCurrentUser(): Promise<{
    uri: string;
    name: string;
    email: string;
    slug: string;
    timezone: string;
    avatar_url?: string;
    scheduling_url: string;
  }> {
    return this.makeRequest<{
      uri: string;
      name: string;
      email: string;
      slug: string;
      timezone: string;
      avatar_url?: string;
      scheduling_url: string;
    }>("/user/");
  }

  // Webhook Management (if supported by backend)
  async createWebhook(
    url: string,
    events: string[],
    organization?: string,
    user?: string,
    scope?: string
  ): Promise<{
    uri: string;
    callback_url: string;
    created_at: string;
    updated_at: string;
    retry_started_at?: string;
    state: string;
    events: string[];
    scope: string;
    organization?: string;
    user?: string;
  }> {
    return this.makeRequest<{
      uri: string;
      callback_url: string;
      created_at: string;
      updated_at: string;
      retry_started_at?: string;
      state: string;
      events: string[];
      scope: string;
      organization?: string;
      user?: string;
    }>("/webhooks/", {
      method: "POST",
      data: {
        url,
        events,
        organization,
        user,
        scope,
      },
    });
  }

  async deleteWebhook(webhookUri: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(
      `/webhooks/${encodeURIComponent(webhookUri)}/`,
      {
        method: "DELETE",
      }
    );
  }

  // Analytics and Reporting (Limited - redirect to Calendly)
  async getEventTypeMetrics(
    eventTypeUri: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total_bookings: number;
    cancelled_bookings: number;
    rescheduled_bookings: number;
    no_show_bookings: number;
    conversion_rate: number;
    popular_times: Array<{
      hour: number;
      count: number;
    }>;
  }> {
    // Limited analytics available via API - recommend using Calendly dashboard
    const params = new URLSearchParams({
      event_type_uri: eventTypeUri,
      start_date: startDate,
      end_date: endDate,
    });
    return this.makeRequest<{
      total_bookings: number;
      cancelled_bookings: number;
      rescheduled_bookings: number;
      no_show_bookings: number;
      conversion_rate: number;
      popular_times: Array<{
        hour: number;
        count: number;
      }>;
    }>(`/analytics/event_types/?${params.toString()}`);
  }

  // Utility Methods
  formatDateForAPI(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  formatDateTimeForAPI(date: Date): string {
    return date.toISOString();
  }

  parseCalendlyDateTime(dateTimeString: string): Date {
    return new Date(dateTimeString);
  }

  generateSchedulingUrl(slug: string): string {
    return `https://calendly.com/${slug}`;
  }

  extractSlugFromUri(uri: string): string {
    const parts = uri.split("/");
    return parts[parts.length - 1];
  }

  // Batch Operations (Limited to cancellation)
  async batchCancelMeetings(
    meetingUris: string[],
    reason: string
  ): Promise<Array<{ uri: string; success: boolean; error?: string }>> {
    const results = await Promise.allSettled(
      meetingUris.map((uri) =>
        this.cancelMeeting({
          meeting_uri: uri,
          reason,
        })
      )
    );

    return results.map((result, index) => ({
      uri: meetingUris[index],
      success: result.status === "fulfilled",
      error: result.status === "rejected" ? result.reason?.message : undefined,
    }));
  }

  // Data Export (Basic)
  async exportMeetings(
    format: "csv" | "json",
    startDate: string,
    endDate: string,
    filters?: {
      status?: string;
      event_type?: string;
    }
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    });

    const response = await fetch(
      `${apiClient.defaults.baseURL}${
        this.baseURL
      }/export/meetings/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // API Capability Information
  getSupportedOperations(): {
    read: string[];
    write: string[];
    limitations: string[];
  } {
    return {
      read: [
        "Get connection status",
        "Get events/meetings",
        "Get event types",
        "Get user information",
        "Get availability",
        "Get webhook subscriptions",
      ],
      write: [
        "Cancel meetings",
        "Create webhook subscriptions",
        "Delete webhook subscriptions",
        "Connect/disconnect Calendly account",
      ],
      limitations: [
        "Cannot create or modify event types",
        "Cannot schedule events directly",
        "Cannot reschedule events (use reschedule URLs)",
        "Cannot modify availability/schedules",
        "Limited analytics data available",
      ],
    };
  }
}

// Create singleton instance
export const calendlyService = new CalendlyService();
export default calendlyService;
