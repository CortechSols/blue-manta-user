import { useState, useRef, useCallback } from "react";
import type { ChatMessage, ChatRequest } from "../types/chatbot";
import { ChatbotAPIClient } from "../lib/api";

export function useChatInterface(
  chatbotId: number,
  apiClient: ChatbotAPIClient
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visitorIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !chatbotId) return;

      // Clear any previous errors
      setError(null);

      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        id: Date.now(),
        conversationId: 0, // Will be updated from response
        sender: "visitor",
        content,
        sentAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const requestPayload: ChatRequest = {
          message: content,
          visitor_id: visitorIdRef.current || undefined,
        };

        const response = await apiClient.sendMessage(chatbotId, requestPayload);
        console.log("message response: ", response)

        // Update visitor ID if provided (for subsequent messages)
        if (response.visitorId) {
          visitorIdRef.current = response.visitorId;
        }

        // Add bot response to local state
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          conversationId: response.conversationId,
          sender: "bot",
          content: response.message,
          sentAt: new Date().toISOString(),
          calendlyUrl: response.calendlyUrl,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        console.error("Failed to send message:", err);
        setError(err instanceof Error ? err.message : "Failed to send message");

        // Remove the user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [chatbotId, apiClient]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    visitorIdRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    visitorId: visitorIdRef.current,
  };
}
