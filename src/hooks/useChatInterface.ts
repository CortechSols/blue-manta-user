import { useState, useRef, useCallback, useEffect } from "react";
import type {
  ChatMessage,
  ChatRequest,
  VisitorMessagesResponse,
  VisitorConversationMessage,
} from "../types/chatbot";
import { ChatbotAPIClient } from "../lib/api";

export function useChatInterface(
  chatbotId: number,
  apiClient: ChatbotAPIClient
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const visitorIdRef = useRef<string | null>(null);

  // Helper function to transform visitor messages to ChatMessage format
  const transformVisitorMessage = (
    visitorMessage: VisitorConversationMessage
  ): ChatMessage => ({
    id: visitorMessage.id,
    conversationId: visitorMessage.conversationId,
    sender: visitorMessage.sender,
    content: visitorMessage.content,
    sentAt: visitorMessage.sentAt,
  });

  // Initialize visitor ID from localStorage and fetch message history
  useEffect(() => {
    const initializeChat = async () => {
      const savedVisitorId = localStorage.getItem("chatbot-visitor-id");
      if (savedVisitorId) {
        visitorIdRef.current = savedVisitorId;

        // Fetch existing messages for this visitor
        setIsLoadingHistory(true);
        try {
          const visitorData: VisitorMessagesResponse =
            await apiClient.getVisitorMessages(savedVisitorId);

          // Get the last conversation (most recent)
          if (
            visitorData.conversations &&
            visitorData.conversations.length > 0
          ) {
            const lastConversation =
              visitorData.conversations[visitorData.conversations.length - 1];

            // Transform and set the messages from the last conversation
            const transformedMessages = lastConversation.messages.map(
              transformVisitorMessage
            );
            setMessages(transformedMessages);
          }
        } catch (err) {
          console.warn("Failed to load visitor message history:", err);
          // Don't show error to user - just continue with empty chat
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    if (chatbotId && apiClient) {
      initializeChat();
    }
  }, [chatbotId, apiClient]);

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
        console.log("message response: ", response);

        // Handle conversation ending
        if (
          response.previousConversationEnded &&
          response.newConversationStarted
        ) {
          setConversationEnded(true);
        }

        // Update visitor ID if provided (for subsequent messages)
        if (response.visitorId) {
          visitorIdRef.current = response.visitorId;
          // Save visitor ID to localStorage
          localStorage.setItem("chatbot-visitor-id", response.visitorId);
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
    setConversationEnded(false);
    visitorIdRef.current = null;
    // Remove visitor ID from localStorage
    localStorage.removeItem("chatbot-visitor-id");
  }, []);

  const restartConversation = useCallback(() => {
    setConversationEnded(false);
    setError(null);
    setMessages([]); // Clear old messages since it's a new conversation
  }, []);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    conversationEnded,
    sendMessage,
    clearChat,
    restartConversation,
    visitorId: visitorIdRef.current,
  };
}
