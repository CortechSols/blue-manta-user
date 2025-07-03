// Chatbot API Types and Interfaces

export interface Chatbot {
  id: number;
  organization: {
    id: number;
    first_name: string;
    last_name: string;
    contact_email: string;
  };
  name: string;
  logo: string | null;
  system_prompt: string;
  conversation_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChatbotRequest {
  name: string;
  logo?: File | null;
  system_prompt: string;
  conversation_limit?: number;
}

export interface UpdateChatbotRequest extends Partial<CreateChatbotRequest> {
  id: number;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender: 'BOT' | 'VISITOR';
  content: string;
  sent_at: string;
}

export interface ChatRequest {
  message: string;
  visitor_id?: string;
}

export interface ChatResponse {
  visitor_id: string;
  message: string;
  requires_info?: boolean;
  conversation_id: number;
  calendly_url?: string;
  date?: string;
  time?: string;
  meetings?: Array<{
    date: string;
    time: string;
    name: string;
  }>;
}

export interface Conversation {
  id: number;
  chatbot_id: number;
  visitor_id: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

// Platform Admin Types
export interface OrganizationChatbotsResponse {
  organization: {
    id: number;
    name: string;
    contact_email: string;
  };
  chatbots: Chatbot[];
  total_count: number;
}

export interface OrganizationSummary {
  id: number;
  name: string;
  contact_email: string;
  is_active: boolean;
  chatbot_count: number;
  created_at: string;
}

export interface OrganizationsListResponse {
  organizations: OrganizationSummary[];
  total_count: number;
}

// UI State Types
export interface ChatbotState {
  chatbots: Chatbot[];
  selectedChatbot: Chatbot | null;
  conversations: Conversation[];
  loading: {
    chatbots: boolean;
    conversations: boolean;
    chat: boolean;
  };
  error: string | null;
}

export interface ChatbotUIState {
  activeTab: 'list' | 'create' | 'edit' | 'chat' | 'conversations';
  selectedChatbotId: number | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showChatModal: boolean;
}

export interface ChatbotModals {
  create: boolean;
  edit: boolean;
  delete: boolean;
  chat: boolean;
  conversation: boolean;
}

// Action Types
export interface ChatbotActions {
  // CRUD Operations
  loadChatbots: () => Promise<void>;
  createChatbot: (data: CreateChatbotRequest) => Promise<void>;
  updateChatbot: (data: UpdateChatbotRequest) => Promise<void>;
  deleteChatbot: (id: number) => Promise<void>;
  getChatbot: (id: number) => Promise<void>;
  
  // Chat Operations
  sendMessage: (chatbotId: number, message: string, visitorId?: string) => Promise<ChatResponse>;
  loadConversation: (conversationId: number) => Promise<void>;
  loadConversations: (chatbotId: number) => Promise<void>;
  
  // Platform Admin Operations
  loadOrganizationChatbots: (organizationId: number) => Promise<void>;
  loadOrganizationsList: () => Promise<void>;
  
  // UI Actions
  setSelectedChatbot: (chatbot: Chatbot | null) => void;
  setActiveTab: (tab: ChatbotUIState['activeTab']) => void;
  openModal: (modal: keyof ChatbotModals) => void;
  closeModal: (modal: keyof ChatbotModals) => void;
  clearError: () => void;
}

export interface ChatbotStore extends ChatbotState, ChatbotUIState {
  modals: ChatbotModals;
  actions: ChatbotActions;
}

// Query Keys
export const chatbotQueryKeys = {
  all: ['chatbots'] as const,
  list: () => [...chatbotQueryKeys.all, 'list'] as const,
  detail: (id: number) => [...chatbotQueryKeys.all, 'detail', id] as const,
  conversations: (chatbotId: number) => [...chatbotQueryKeys.all, 'conversations', chatbotId] as const,
  conversation: (conversationId: number) => [...chatbotQueryKeys.all, 'conversation', conversationId] as const,
  organizationChatbots: (organizationId: number) => [...chatbotQueryKeys.all, 'organization', organizationId] as const,
  organizationsList: () => [...chatbotQueryKeys.all, 'organizations'] as const,
} as const; 