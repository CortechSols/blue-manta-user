import apiClient from "./api";
import type {
  Chatbot,
  UpdateChatbotRequest,
  ChatRequest,
  ChatResponse,
  ChatMessage,
  ConversationsResponse,
  OrganizationChatbotsResponse,
  OrganizationsListResponse,
  DataSource,
  CreateDataSourceRequest,
  OrganizationDashboardData,
  ConversationStatus,
} from "../types/chatbot";

export class ChatbotService {
  private baseURL: string;

  constructor() {
    this.baseURL = "/chatbots";
  }

  // Generic request method
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      body?: string | FormData;
      params?: Record<string, any>;
    } = {}
  ): Promise<T> {
    const { method = "GET", body, params } = options;

    try {
      let response;
      const url = `${this.baseURL}${endpoint}`;

      switch (method) {
        case "GET":
          response = await apiClient.get(url, { params });
          break;
        case "POST":
          response = await apiClient.post(url, body);
          break;
        case "PUT":
          response = await apiClient.put(url, body);
          break;
        case "PATCH":
          response = await apiClient.patch(url, body);
          break;
        case "DELETE":
          response = await apiClient.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response.data;
    } catch (error) {
      console.error(`Chatbot API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  // Chatbot CRUD Operations
  async getChatbots(): Promise<Chatbot[]> {
    try {
      return this.makeRequest<Chatbot[]>("/");
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error(
          "Chatbot endpoints are not available on the backend yet. Please contact your administrator to enable chatbot functionality."
        );
      }
      throw error;
    }
  }

  async getChatbot(id: number): Promise<Chatbot> {
    return this.makeRequest<Chatbot>(`/${id}/`);
  }

  async createChatbot(data: FormData): Promise<Chatbot> {
    return this.makeRequest<Chatbot>("/", {
      method: "POST",
      body: data,
    });
  }

  async updateChatbot(data: UpdateChatbotRequest): Promise<Chatbot> {
    return this.makeRequest<Chatbot>(`/${data.id}/`, {
      method: "PUT",
      body: data.formData,
    });
  }

  async patchChatbot(data: UpdateChatbotRequest): Promise<Chatbot> {
    return this.makeRequest<Chatbot>(`/${data.id}/`, {
      method: "PATCH",
      body: data.formData,
    });
  }

  async deleteChatbot(id: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/${id}/`, {
      method: "DELETE",
    });
  }

  // Chat Operations
  async sendMessage(
    chatbotId: number,
    request: ChatRequest
  ): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>(`/${chatbotId}/chat/`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getConversationMessages(
    conversationId: number
  ): Promise<ChatMessage[]> {
    try {
      return await apiClient
        .get(`/conversations/${conversationId}/messages/`)
        .then((response) => response.data);
    } catch (error: any) {
      console.error("Conversation messages API error:", error);
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error(
          "Conversation messages endpoints are not available on the backend yet. Please contact your administrator to enable conversation functionality."
        );
      }
      throw error;
    }
  }

  // Conversations Operations
  async getConversations(params?: {
    page?: number;
    page_size?: number;
    chatbot_id?: number;
    search_by?: string;
    status_names?: string;
  }): Promise<ConversationsResponse> {
    try {
      return await apiClient
        .get("/conversations/", { params })
        .then((response) => response.data);
    } catch (error: any) {
      console.error("Conversations API error:", error);
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error(
          "Conversations endpoints are not available on the backend yet. Please contact your administrator to enable conversation functionality."
        );
      }
      throw error;
    }
  }

  async getConversationStatuses(): Promise<ConversationStatus[]> {
    try {
      return await apiClient
        .get("/conversations/conversation-statuses/")
        .then((response) => response.data);
    } catch (error: any) {
      console.error("Conversation statuses API error:", error);
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error(
          "Conversation statuses endpoints are not available on the backend yet. Please contact your administrator to enable this functionality."
        );
      }
      throw error;
    }
  }

  // Platform Admin Operations
  async getOrganizationChatbots(
    organizationId: number
  ): Promise<OrganizationChatbotsResponse> {
    return this.makeRequest<OrganizationChatbotsResponse>(
      "/organization_chatbots/",
      {
        params: { organization_id: organizationId },
      }
    );
  }

  async getOrganizationsList(): Promise<OrganizationsListResponse> {
    return this.makeRequest<OrganizationsListResponse>("/list_organizations/");
  }

  // Data Source Operations
  async getDataSources(params?: {
    page?: number;
    page_size?: number;
    search_by?: string;
    chatbot_id?: number;
  }): Promise<
    | DataSource[]
    | {
        dataSources: DataSource[];
        totalCount: number;
        page: number;
        totalPages: number;
      }
  > {
    try {
      let endpoint = "/data-sources/";

      // Add query parameters if provided
      if (params) {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.page_size)
          searchParams.append("page_size", params.page_size.toString());
        if (params.search_by)
          searchParams.append("search_by", params.search_by);
        if (params.chatbot_id)
          searchParams.append("chatbot_id", params.chatbot_id.toString());

        const queryString = searchParams.toString();
        if (queryString) {
          endpoint += `?${queryString}`;
        }
      }

      const response = await apiClient
        .get(endpoint)
        .then((response) => response.data);

      return response;
    } catch (error: any) {
      console.error("Data sources API error:", error);
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error(
          "Data source endpoints are not available on the backend yet. Please contact your administrator to enable data source functionality."
        );
      }
      throw error;
    }
  }

  async createDataSource(data: CreateDataSourceRequest): Promise<DataSource> {
    try {
      const formData = new FormData();
      formData.append("chatbot_id", data.chatbot_id.toString());
      formData.append("source_type", data.source_type);
      formData.append("file", data.file);

      return await apiClient
        .post("/data-sources/", formData)
        .then((response) => response.data);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error(
          "Data source endpoints are not available on the backend yet. Please contact your administrator to enable data source functionality."
        );
      }
      throw error;
    }
  }

  async deleteDataSource(id: number): Promise<{ message: string }> {
    try {
      return await apiClient
        .delete(`/data-sources/${id}/`)
        .then((response) => response.data);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error(
          "Data source endpoints are not available on the backend yet. Please contact your administrator to enable data source functionality."
        );
      }
      throw error;
    }
  }

  // API Capability Information
  getSupportedOperations(): {
    read: string[];
    write: string[];
    limitations: string[];
  } {
    return {
      read: [
        "List chatbots",
        "Get chatbot details",
        "Get conversation messages",
        "List conversations with search and filtering",
        "Get conversation statuses",
        "Get organization chatbots (Platform Admin)",
        "List organizations (Platform Admin)",
        "List data sources",
        "Get organization dashboard data",
      ],
      write: [
        "Create chatbot",
        "Update chatbot",
        "Delete chatbot",
        "Send chat messages",
        "Upload data sources",
      ],
      limitations: [
        "Chat messages are public (no authentication required)",
        "File uploads only supported for logo images and data sources",
        "Data sources support PDF and DOCX formats only",
        "Conversation limits are enforced per chatbot",
        "Platform admin endpoints require special permissions",
        "Dashboard data includes mock chart data for visualization",
        "Conversation search supports visitor name, email, chatbot name, and message content",
        "Conversation filtering supports chatbot ID and status",
      ],
    };
  }

  // Dashboard Operations
  async getOrganizationDashboard(): Promise<OrganizationDashboardData> {
    try {
      return await apiClient
        .get("/dashboard/organization-dashboard/")
        .then((response) => response.data);
    } catch (error: any) {
      console.error("Organization dashboard API error:", error);
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error(
          "Dashboard endpoints are not available on the backend yet. Please contact your administrator to enable dashboard functionality."
        );
      }
      throw error;
    }
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();
