import apiClient from './api';
import { shouldUseDemoData, demoApiResponses } from './demo-data';
import type {
  CalendlyEventsResponse,
  CalendlyMeetingsResponse,
  CalendlyEventTypesResponse,
  CalendlyAvailabilityResponse,
  CalendlyAvailableSlotsResponse,
  ConnectionStatus,
  CancelMeetingRequest,
  AvailableTimesRequest,
} from '../types/calendly';

export class CalendlyService {
  private baseURL: string;

  constructor() {
    this.baseURL = '/integrations/calendly';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await apiClient({
        url: `${this.baseURL}${endpoint}`,
        method: options.method || 'GET',
        data: options.body ? JSON.parse(options.body as string) : undefined,
        params: options.method === 'GET' ? this.parseSearchParams(endpoint) : undefined,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`Calendly API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  private parseSearchParams(endpoint: string): Record<string, string> | undefined {
    const url = new URL(endpoint, 'http://dummy.com');
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length > 0 ? params : undefined;
  }

  // Connection Management
  async getConnectionStatus(): Promise<ConnectionStatus> {
    if (shouldUseDemoData()) {
      return demoApiResponses.connectionStatus();
    }
    
    try {
      const response = await this.makeRequest<any>('/connection_status/');
      console.log('Raw connection status response:', response);
      
      // Handle different response formats
      if (response.isConnected !== undefined) {
        // CamelCase format: { isConnected: true, schedulingUrl: "...", userName: "..." }
        return {
          is_connected: response.isConnected,
          scheduling_url: response.schedulingUrl || '',
          user_name: response.userName || '',
        };
      } else if (response.is_connected !== undefined) {
        // Snake_case format: { is_connected: true, scheduling_url: "...", user_name: "..." }
        return {
          is_connected: response.is_connected,
          scheduling_url: response.scheduling_url || '',
          user_name: response.user_name || '',
        };
      } else if (response.is_active !== undefined) {
        // Integration format: { id: 1, is_active: true, config_blob: "..." }
        let userInfo = {};
        try {
          if (response.config_blob && response.config_blob !== 'undefined' && typeof response.config_blob === 'string') {
            userInfo = JSON.parse(response.config_blob);
          }
        } catch (e) {
          console.warn('Failed to parse config_blob:', e);
        }
        
        return {
          is_connected: response.is_active,
          scheduling_url: (userInfo as any)?.scheduling_url || '',
          user_name: (userInfo as any)?.user_name || '',
          integration: {
            id: response.id,
            organization: response.organization,
            provider: response.provider,
            connected_at: response.connected_at,
            expires_at: response.expires_at,
            is_active: response.is_active,
            config_blob: userInfo,
          }
        };
      } else {
        // Unknown format
        console.warn('Unknown connection status response format:', response);
        return {
          is_connected: false,
        };
      }
    } catch (error) {
      console.error('Connection status request failed:', error);
      // If we can't get connection status, we're not connected
      return {
        is_connected: false,
      };
    }
  }

  async connectCalendly(code: string, codeVerifier?: string): Promise<ConnectionStatus> {
    const payload: { code: string; code_verifier?: string } = { code };
    if (codeVerifier) {
      payload.code_verifier = codeVerifier;
    }
    
    return this.makeRequest<ConnectionStatus>('/connect/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async disconnectCalendly(): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>('/disconnect/', {
      method: 'POST',
    });
  }

  // Calendar Events (Read Only)
  async getEvents(startDate: string, endDate: string): Promise<CalendlyEventsResponse> {
    if (shouldUseDemoData()) {
      return demoApiResponses.events();
    }
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    return this.makeRequest<CalendlyEventsResponse>(`/events/?${params.toString()}`);
  }

  async getMeetings(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    page_token?: string;
    count?: number;
  }): Promise<CalendlyMeetingsResponse> {
    if (shouldUseDemoData()) {
      return demoApiResponses.meetings();
    }
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    const queryString = searchParams.toString();
    return this.makeRequest<CalendlyMeetingsResponse>(
      `/meetings/${queryString ? `?${queryString}` : ''}`
    );
  }

  // Meeting Management (Limited)
  async cancelMeeting(request: CancelMeetingRequest): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('/cancel_meeting/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Note: Rescheduling is not supported via API - use reschedule URLs from meeting data
  async rescheduleMeeting(
    meetingUri: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    // This method is kept for backwards compatibility but will return an error
    throw new Error('Rescheduling via API is not supported. Please use the reschedule URL provided in the meeting data.');
  }

  // Availability (Read Only)
  async getAvailability(): Promise<CalendlyAvailabilityResponse> {
    if (shouldUseDemoData()) {
      return demoApiResponses.availability();
    }
    return this.makeRequest<CalendlyAvailabilityResponse>('/availability/');
  }

  async getAvailableSlots(request: AvailableTimesRequest): Promise<CalendlyAvailableSlotsResponse> {
    return this.makeRequest<CalendlyAvailableSlotsResponse>('/available_times/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Event Types (Read Only)
  async getEventTypes(): Promise<CalendlyEventTypesResponse> {
    if (shouldUseDemoData()) {
      return demoApiResponses.eventTypes();
    }
    return this.makeRequest<CalendlyEventTypesResponse>('/event_types/');
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
    }>('/user/');
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
    }>('/webhooks/', {
      method: 'POST',
      body: JSON.stringify({
        url,
        events,
        organization,
        user,
        scope,
      }),
    });
  }

  async deleteWebhook(webhookUri: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/webhooks/${encodeURIComponent(webhookUri)}/`, {
      method: 'DELETE',
    });
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
    return date.toISOString().split('T')[0];
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
    const parts = uri.split('/');
    return parts[parts.length - 1];
  }

  // Batch Operations (Limited to cancellation)
  async batchCancelMeetings(
    meetingUris: string[],
    reason: string
  ): Promise<Array<{ uri: string; success: boolean; error?: string }>> {
    const results = await Promise.allSettled(
      meetingUris.map(uri =>
        this.cancelMeeting({
          meeting_uri: uri,
          reason,
        })
      )
    );

    return results.map((result, index) => ({
      uri: meetingUris[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason?.message : undefined,
    }));
  }

  // Data Export (Basic)
  async exportMeetings(
    format: 'csv' | 'json',
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

    const response = await fetch(`${apiClient.defaults.baseURL}${this.baseURL}/export/meetings/?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

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
        'Get connection status',
        'Get events/meetings',
        'Get event types',
        'Get user information',
        'Get availability',
        'Get webhook subscriptions'
      ],
      write: [
        'Cancel meetings',
        'Create webhook subscriptions',
        'Delete webhook subscriptions',
        'Connect/disconnect Calendly account'
      ],
      limitations: [
        'Cannot create or modify event types',
        'Cannot schedule events directly',
        'Cannot reschedule events (use reschedule URLs)',
        'Cannot modify availability/schedules',
        'Limited analytics data available'
      ]
    };
  }
}

// Create singleton instance
export const calendlyService = new CalendlyService();
export default calendlyService; 