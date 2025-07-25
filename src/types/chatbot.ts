// Chatbot API Types and Interfaces

export interface Chatbot {
  id: number;
  organization: {
    id: number;
    firstName: string;
    lastName: string;
    contactEmail: string;
  };
  name: string;
  logo: string | null;
  systemPrompt: string;
  textPrompt?: string | null;
  sendButtonColor?: string;
  botTextColor?: string;
  userTextColor?: string;
  botMessageBubbleColor?: string;
  userMessageBubbleColor?: string;
  headerColor?: string;
  image?: string | null;
  conversationLimit: number;
  createdAt: string;
  updatedAt: string;
  hubspotConnected?: boolean;
  hubspotStatus?: {
    connected: boolean;
    isValid: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Data Source Types
export interface DataSource {
  id: number;
  chatbotId: number;
  chatbotName: string;
  sourceType: "pdf" | "docx";
  content: string; // This is the file name
  file: string; // File URL
  fileUrl: string; // Duplicate file URL
  fileName: string;
  lastSyncedAt: string;
}

export interface CreateDataSourceRequest {
  chatbot_id: number;
  source_type: "pdf" | "docx";
  file: File;
}

export interface DataSourcesResponse {
  data_sources: DataSource[];
  total_count: number;
}

export interface CreateChatbotRequest {
  name: string;
  logo?: File | null;
  image?: File | null;
  systemPrompt: string;
  textPrompt?: string;
  sendButtonColor?: string;
  botTextColor?: string;
  userTextColor?: string;
  botMessageBubbleColor?: string;
  userMessageBubbleColor?: string;
  headerColor?: string;
  conversationLimit?: number;
}

export interface UpdateChatbotRequest {
  id: number;
  formData: FormData;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  sender: "bot" | "visitor";
  content: string;
  sentAt: string;
  calendlyUrl?: string;
}

export interface ChatRequest {
  message: string;
  visitor_id?: string;
}

export interface ChatResponse {
  visitorId: string;
  message: string;
  requiresInfo?: boolean;
  conversationId: number;
  calendlyUrl?: string;
  date?: string;
  time?: string;
  meetings?: Array<{
    date: string;
    time: string;
    name?: string;
    meetingLink?: string;
  }>;
}

export interface Conversation {
  statusDisplay: string;
  statusColor: string;
  id: number;
  chatbotId: number;
  chatbotName: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
  lastMessage: {
    content: string;
    sender: "bot" | "visitor";
    sentAt: string;
  };
}

export interface ConversationsResponse {
  conversations: Conversation[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
  activeTab: "list" | "create" | "edit" | "chat" | "conversations";
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
  sendMessage: (
    chatbotId: number,
    message: string,
    visitorId?: string
  ) => Promise<ChatResponse>;
  loadConversation: (conversationId: number) => Promise<void>;
  loadConversations: (chatbotId: number) => Promise<void>;

  // Platform Admin Operations
  loadOrganizationChatbots: (organizationId: number) => Promise<void>;
  loadOrganizationsList: () => Promise<void>;

  // UI Actions
  setSelectedChatbot: (chatbot: Chatbot | null) => void;
  setActiveTab: (tab: ChatbotUIState["activeTab"]) => void;
  openModal: (modal: keyof ChatbotModals) => void;
  closeModal: (modal: keyof ChatbotModals) => void;
  clearError: () => void;
}

export interface ChatbotStore extends ChatbotState, ChatbotUIState {
  modals: ChatbotModals;
  actions: ChatbotActions;
}

// Query Keys
// Widget-specific types for embedding
export interface ChatbotAppearance {
  headerColor: string;
  userMessageBubbleColor: string;
  botMessageBubbleColor: string;
  userTextColor: string;
  botTextColor: string;
  sendButtonColor: string;
  image: string | null;
  logo: string | null;
}

export interface ChatbotAppearanceResponse {
  success: boolean;
  data: ChatbotAppearance;
}

export interface ChatbotConfig {
  id: number;
  name: string;
  logo?: string;
  primaryColor?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  apiBaseUrl: string;
}

// Widget configuration passed via URL params
export interface WidgetConfig {
  chatbotId: string;
  apiBaseUrl?: string;
  theme?: "light" | "dark";
  primaryColor?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  greeting?: string;
  height?: string;
  width?: string;
}

export const chatbotQueryKeys = {
  all: ["chatbots"] as const,
  list: () => [...chatbotQueryKeys.all, "list"] as const,
  detail: (id: number) => [...chatbotQueryKeys.all, "detail", id] as const,
  conversations: (params?: Record<string, unknown>) =>
    [...chatbotQueryKeys.all, "conversations", params] as const,
  conversation: (conversationId: number) =>
    [...chatbotQueryKeys.all, "conversation", conversationId] as const,
  conversationStatuses: () =>
    [...chatbotQueryKeys.all, "conversationStatuses"] as const,
  organizationChatbots: (organizationId: number) =>
    [...chatbotQueryKeys.all, "organization", organizationId] as const,
  organizationsList: () => [...chatbotQueryKeys.all, "organizations"] as const,
  dataSources: (params?: Record<string, unknown>) => [...chatbotQueryKeys.all, "dataSources", params] as const,
  dataSource: (id: number) =>
    [...chatbotQueryKeys.all, "dataSource", id] as const,
  dashboard: () => [...chatbotQueryKeys.all, "dashboard"] as const,
} as const;

// Dashboard Types
export interface TopPerformingChatbot {
  id: number;
  name: string;
  messageCount: number;
}

export interface RecentChatSummary {
  id: number;
  chatbotId: number;
  chatbotName: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
  lastMessage: {
    content: string;
    sender: "bot" | "visitor";
    sentAt: string;
  };
  status: string;
  statusDisplay: string;
  statusColor: string;
}

export interface OrganizationDashboardData {
  totalConversations: number;
  leadsCaptured: number;
  meetingsBooked: number;
  activeChatbots: number;
  dataSourceCount: number;
  topPerformingChatbots: TopPerformingChatbot[];
  leadConversionRate: number;
  recentChatsSummary: RecentChatSummary[];
  averageChatDuration: number;
}

export interface ConversationStatus {
  value: string;
  label: string;
}
