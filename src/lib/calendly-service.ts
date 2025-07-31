import apiClient from "./api";
import type {
  CalendlyEventsResponse,
  CalendlyMeetingsResponse,
  CalendlyEventTypesResponse,
  CalendlyAvailabilityResponse,
  ConnectionStatus,
  CancelMeetingRequest,
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

  // Event Types (Read Only)
  async getEventTypes(): Promise<CalendlyEventTypesResponse> {
    return this.makeRequest<CalendlyEventTypesResponse>("/event_types/");
  }

  // Utility Methods
  formatDateForAPI(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}

// Create singleton instance
export const calendlyService = new CalendlyService();
export default calendlyService;
