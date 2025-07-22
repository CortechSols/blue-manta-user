import { useMemo, useState, useEffect } from "react";
import { ChatWidget } from "../components/widget/ChatWidget";
import { ChatbotAPIClient, getConfigFromURL } from "../lib/api";
import { useChatbotAppearance } from "../hooks/useChatbotAppearance";

function WidgetPage() {
  const [config, setConfig] = useState<{
    chatbotId: number;
    apiBaseUrl: string;
    theme?: string;
    primaryColor?: string;
    greeting?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize configuration from URL parameters
  useEffect(() => {
    try {
      const urlConfig = getConfigFromURL();
      setConfig(urlConfig);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load configuration"
      );
    }
  }, []);

  // Create API client
  const apiClient = useMemo(() => {
    if (!config) return null;
    return new ChatbotAPIClient(config.apiBaseUrl);
  }, [config]);

  // Fetch chatbot appearance
  const {
    appearance,
    isLoading: appearanceLoading,
    error: appearanceError,
  } = useChatbotAppearance(config?.chatbotId || 0, apiClient!);

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Configuration Error
              </h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-red-500">
            <p>Required URL parameters:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                <code>chatbotId</code> - The ID of your chatbot
              </li>
              <li>
                <code>apiBaseUrl</code> - Your API base URL (optional, defaults
                to current origin)
              </li>
            </ul>
            <p className="mt-2">
              Example:{" "}
              <code>?chatbotId=123&apiBaseUrl=https://your-api.com</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!config || !apiClient || appearanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading chat widget...</p>
        </div>
      </div>
    );
  }

  // Show appearance error state
  if (appearanceError) {
    console.warn("Failed to load chatbot appearance:", appearanceError);
    // Continue with default appearance
  }

  return (
    <div className="h-full w-full relative">
      <ChatWidget
        chatbotId={config.chatbotId}
        apiClient={apiClient}
        greeting={config.greeting}
        primaryColor={config.primaryColor}
        theme={config.theme as "light" | "dark"}
        appearance={appearance}
        appearanceLoading={appearanceLoading}
      />
    </div>
  );
}

export default WidgetPage;
