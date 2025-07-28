import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "../lib/chatbot-service";
import type {
  UpdateChatbotRequest,
  ChatRequest,
  ChatMessage,
  CreateDataSourceRequest,
} from "../types/chatbot";
import { chatbotQueryKeys } from "../types/chatbot";

// Chatbot CRUD Hooks
export function useChatbots() {
  return useQuery({
    queryKey: chatbotQueryKeys.list(),
    queryFn: () => chatbotService.getChatbots(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useChatbot(id: number) {
  return useQuery({
    queryKey: chatbotQueryKeys.detail(id),
    queryFn: () => chatbotService.getChatbot(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useCreateChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => chatbotService.createChatbot(data),
    onSuccess: () => {
      // Invalidate chatbots list
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.list() });
    },
    onError: (error) => {
      console.error("Failed to create chatbot:", error);
    },
  });
}

export function useUpdateChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateChatbotRequest) =>
      chatbotService.updateChatbot(data),
    onSuccess: (updatedChatbot, variables) => {
      // Use the chatbot ID from the request variables since we know it exists
      const chatbotId = variables.id;

      // Invalidate chatbots list and specific chatbot
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.list() });
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.detail(chatbotId),
      });

      // If the response includes the updated chatbot data, update the cache
      if (updatedChatbot && updatedChatbot.id) {
        queryClient.setQueryData(
          chatbotQueryKeys.detail(chatbotId),
          updatedChatbot
        );
      }
    },
    onError: (error) => {
      console.error("Failed to update chatbot:", error);
    },
  });
}

export function usePatchChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateChatbotRequest) =>
      chatbotService.patchChatbot(data),
    onSuccess: (updatedChatbot, variables) => {
      // Use the chatbot ID from the request variables since we know it exists
      const chatbotId = variables.id;

      // Invalidate chatbots list and specific chatbot
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.list() });
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.detail(chatbotId),
      });

      // If the response includes the updated chatbot data, update the cache
      if (updatedChatbot && updatedChatbot.id) {
        queryClient.setQueryData(
          chatbotQueryKeys.detail(chatbotId),
          updatedChatbot
        );
      }
    },
    onError: (error) => {
      console.error("Failed to patch chatbot:", error);
    },
  });
}

export function useDeleteChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatbotService.deleteChatbot(id),
    onSuccess: (_, id) => {
      // Invalidate chatbots list and remove specific chatbot from cache
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.list() });
      queryClient.removeQueries({ queryKey: chatbotQueryKeys.detail(id) });
    },
    onError: (error) => {
      console.error("Failed to delete chatbot:", error);
    },
  });
}

// Chat Operations Hooks
export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      chatbotId,
      request,
    }: {
      chatbotId: number;
      request: ChatRequest;
    }) => chatbotService.sendMessage(chatbotId, request),
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
  });
}

export function useConversationMessages(conversationId: number) {
  return useQuery({
    queryKey: chatbotQueryKeys.conversation(conversationId),
    queryFn: () => chatbotService.getConversationMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

// Conversations Hooks
export function useConversations(params?: {
  page?: number;
  page_size?: number;
  chatbot_id?: number;
  search_by?: string;
  status_names?: string;
}) {
  return useQuery({
    queryKey: chatbotQueryKeys.conversations(params),
    queryFn: () => chatbotService.getConversations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function useConversationStatuses() {
  return useQuery({
    queryKey: chatbotQueryKeys.conversationStatuses(),
    queryFn: () => chatbotService.getConversationStatuses(),
    staleTime: 10 * 60 * 1000, // 10 minutes (statuses don't change often)
    retry: 2,
  });
}

// Platform Admin Hooks
export function useOrganizationChatbots(organizationId: number) {
  return useQuery({
    queryKey: chatbotQueryKeys.organizationChatbots(organizationId),
    queryFn: () => chatbotService.getOrganizationChatbots(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useOrganizationsList() {
  return useQuery({
    queryKey: chatbotQueryKeys.organizationsList(),
    queryFn: () => chatbotService.getOrganizationsList(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Data Source Hooks
export function useDataSources(params?: {
  page?: number;
  page_size?: number;
  search_by?: string;
  chatbot_id?: number;
}) {
  return useQuery({
    queryKey: chatbotQueryKeys.dataSources(params),
    queryFn: () => chatbotService.getDataSources(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useCreateDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDataSourceRequest) =>
      chatbotService.createDataSource(data),
    onSuccess: () => {
      // Invalidate data sources list
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.dataSources(),
      });
    },
    onError: (error) => {
      console.error("Failed to create data source:", error);
    },
  });
}

export function useDeleteDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatbotService.deleteDataSource(id),
    onSuccess: () => {
      // Invalidate data sources list
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.dataSources(),
      });
    },
    onError: (error) => {
      console.error("Failed to delete data source:", error);
    },
  });
}

// Utility Hooks
export function useChatbotRefresh() {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.all });
    },
    refreshList: () => {
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.list() });
    },
    refreshChatbot: (id: number) => {
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.detail(id) });
    },
    refreshConversations: (params?: Record<string, unknown>) => {
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.conversations(params),
      });
    },
    refreshConversation: (conversationId: number) => {
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.conversation(conversationId),
      });
    },
    refreshOrganizationChatbots: (organizationId: number) => {
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.organizationChatbots(organizationId),
      });
    },
    refreshOrganizationsList: () => {
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.organizationsList(),
      });
    },
    refreshDataSources: () => {
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.dataSources(),
      });
    },
    refreshConversationStatuses: () => {
      queryClient.invalidateQueries({
        queryKey: chatbotQueryKeys.conversationStatuses(),
      });
    },
  };
}

// Combined hooks for dashboard
export function useChatbotDashboardData() {
  const chatbots = useChatbots();
  const organizationsList = useOrganizationsList();

  return {
    chatbots,
    organizationsList,
    isLoading: chatbots.isLoading || organizationsList.isLoading,
    isError: chatbots.isError || organizationsList.isError,
    error: chatbots.error || organizationsList.error,
  };
}

// Chat interface hook
export function useChatInterface(chatbotId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const visitorIdRef = useRef<string | null>(null);
  const sendMessage = useSendMessage();

  const sendChatMessage = async (content: string, visitorId?: string) => {
    if (!content.trim() || !chatbotId) return;

    // Add user message to local state immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      conversationId: 0, // Will be updated from response
      sender: "visitor",
      content,
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const requestPayload = {
        message: content,
        visitor_id: visitorId || undefined,
      };

      const response = await sendMessage.mutateAsync({
        chatbotId,
        request: requestPayload,
      });

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
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    }
  };

  const clearChat = () => {
    setMessages([]);
    visitorIdRef.current = null;
  };

  return {
    messages: chatbotId ? messages : [],
    visitorId: chatbotId ? visitorIdRef.current : null,
    sendMessage: sendChatMessage,
    clearChat,
    isLoading: chatbotId ? sendMessage.isPending : false,
    error: chatbotId ? sendMessage.error : null,
  };
}

// Dashboard hooks
export function useDashboardData() {
  return useQuery({
    queryKey: chatbotQueryKeys.dashboard(),
    queryFn: () => chatbotService.getOrganizationDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
