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
  async getDataSources(): Promise<DataSource[]> {
    try {
      const response = await apiClient
        .get("/data-sources/")
        .then((response) => response.data);

      console.log("Data sources response:", response);

      // Check if response is directly an array of data sources
      if (Array.isArray(response)) {
        return response;
      }

      // Check if response has data_sources wrapper
      if (response?.dataSources && Array.isArray(response.dataSources)) {
        console.log(
          "Response has data_sources wrapper, returning:",
          response.dataSources
        );
        return response.dataSources;
      }

      console.log("Response format unexpected, returning empty array");
      return [];
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
        "Get organization chatbots (Platform Admin)",
        "List organizations (Platform Admin)",
        "List data sources",
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
      ],
    };
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();
