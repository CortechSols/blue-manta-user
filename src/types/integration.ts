export interface PipedreamIntegrationConfig {
  url: string;
  secret: string;
}

export interface PipedreamIntegration {
  id: number;
  organization: number;
  provider: string; // e.g., 'pipedream_webhook'
  connectedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  configBlob: PipedreamIntegrationConfig;
}

export interface OutboundEventPayload {
  lead?: Record<string, any>;
  chatbot?: Record<string, any>;
  timestamp?: string;
  event_type?: string;
  organization?: Record<string, any>;
  payload_version?: number;
}

export interface OutboundEvent {
  id: number;
  organization: number;
  integration: number;
  eventType: string;
  payloadJson: OutboundEventPayload;
  status: "failed" | "pending" | "delivered";
  attempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;
  responseCode: number | null;
  responseBody: string | null;
  nextRetryAt: string | null;
  createdAt: string;
}

export interface OutboundEventListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OutboundEvent[];
} 