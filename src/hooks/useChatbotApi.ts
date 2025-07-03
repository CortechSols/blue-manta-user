import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotService } from '../lib/chatbot-service';
import type {
  Chatbot,
  CreateChatbotRequest,
  UpdateChatbotRequest,
  ChatRequest,
  ChatResponse,
  ChatMessage,
  OrganizationChatbotsResponse,
  OrganizationsListResponse,
} from '../types/chatbot';
import { chatbotQueryKeys } from '../types/chatbot';

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
    mutationFn: (data: CreateChatbotRequest) => chatbotService.createChatbot(data),
    onSuccess: () => {
      // Invalidate chatbots list
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.list() });
    },
    onError: (error) => {
      console.error('Failed to create chatbot:', error);
    },
  });
}

export function useUpdateChatbot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateChatbotRequest) => chatbotService.updateChatbot(data),
    onSuccess: (data) => {
      // Invalidate chatbots list and specific chatbot
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.detail(data.id) });
      // Update the specific chatbot in cache
      queryClient.setQueryData(chatbotQueryKeys.detail(data.id), data);
    },
    onError: (error) => {
      console.error('Failed to update chatbot:', error);
    },
  });
}

export function usePatchChatbot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateChatbotRequest) => chatbotService.patchChatbot(data),
    onSuccess: (data) => {
      // Invalidate chatbots list and specific chatbot
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.detail(data.id) });
      // Update the specific chatbot in cache
      queryClient.setQueryData(chatbotQueryKeys.detail(data.id), data);
    },
    onError: (error) => {
      console.error('Failed to patch chatbot:', error);
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
      console.error('Failed to delete chatbot:', error);
    },
  });
}

// Chat Operations Hooks
export function useSendMessage() {
  return useMutation({
    mutationFn: ({ chatbotId, request }: { chatbotId: number; request: ChatRequest }) =>
      chatbotService.sendMessage(chatbotId, request),
    onError: (error) => {
      console.error('Failed to send message:', error);
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
    refreshConversation: (conversationId: number) => {
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.conversation(conversationId) });
    },
    refreshOrganizationChatbots: (organizationId: number) => {
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.organizationChatbots(organizationId) });
    },
    refreshOrganizationsList: () => {
      queryClient.invalidateQueries({ queryKey: chatbotQueryKeys.organizationsList() });
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
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const sendMessage = useSendMessage();

  const sendChatMessage = async (content: string) => {
    if (!content.trim() || !chatbotId) return;

    // Add user message to local state immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      conversation_id: 0, // Will be updated from response
      sender: 'VISITOR',
      content,
      sent_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await sendMessage.mutateAsync({
        chatbotId,
        request: {
          message: content,
          visitor_id: visitorId || undefined,
        },
      });

      // Update visitor ID if provided
      if (response.visitor_id && !visitorId) {
        setVisitorId(response.visitor_id);
      }

      // Add bot response to local state
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        conversation_id: response.conversation_id,
        sender: 'BOT',
        content: response.message,
        sent_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  };

  const clearChat = () => {
    setMessages([]);
    setVisitorId(null);
  };

  return {
    messages: chatbotId ? messages : [],
    visitorId: chatbotId ? visitorId : null,
    sendMessage: sendChatMessage,
    clearChat,
    isLoading: chatbotId ? sendMessage.isPending : false,
    error: chatbotId ? sendMessage.error : null,
  };
} 