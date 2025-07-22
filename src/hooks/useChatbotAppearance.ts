import { useState, useEffect } from "react";
import type { ChatbotAppearance } from "../types/chatbot";
import { ChatbotAPIClient } from "../lib/api";

export function useChatbotAppearance(
  chatbotId: number,
  apiClient: ChatbotAPIClient
) {
  const [appearance, setAppearance] = useState<ChatbotAppearance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppearance = async () => {
      if (!chatbotId || !apiClient) {
        setError("Missing chatbot ID or API client");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.getAppearance(chatbotId);

        if (response.success) {
          setAppearance(response.data);
        } else {
          setError("Failed to fetch appearance data");
        }
      } catch (err) {
        console.error("Failed to fetch chatbot appearance:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch appearance"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppearance();
  }, [chatbotId, apiClient]);

  return {
    appearance,
    isLoading,
    error,
  };
}
