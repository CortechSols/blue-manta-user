export interface PipedreamIntegrationConfig {
  url: string;
  secret: string;
}

export interface PipedreamIntegration {
  id: number;
  organization: number;
  provider: string; // e.g., 'pipedream_webhook'
  connected_at: string;
  expires_at: string | null;
  is_active: boolean;
  config_blob: PipedreamIntegrationConfig;
} 