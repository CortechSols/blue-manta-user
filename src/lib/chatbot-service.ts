import apiClient from './api';
import type {
  Chatbot,
  CreateChatbotRequest,
  UpdateChatbotRequest,
  ChatRequest,
  ChatResponse,
  ChatMessage,
  Conversation,
  OrganizationChatbotsResponse,
  OrganizationsListResponse,
} from '../types/chatbot';

export class ChatbotService {
  private baseURL: string;

  constructor() {
    this.baseURL = '/chatbots';
  }

  // Generic request method
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: string | FormData;
      params?: Record<string, any>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params } = options;

    try {
      let response;
      const url = `${this.baseURL}${endpoint}`;

      switch (method) {
        case 'GET':
          response = await apiClient.get(url, { params });
          break;
        case 'POST':
          response = await apiClient.post(url, body);
          break;
        case 'PUT':
          response = await apiClient.put(url, body);
          break;
        case 'PATCH':
          response = await apiClient.patch(url, body);
          break;
        case 'DELETE':
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
      return this.makeRequest<Chatbot[]>('/');
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error('Chatbot endpoints are not available on the backend yet. Please contact your administrator to enable chatbot functionality.');
      }
      throw error;
    }
  }

  async getChatbot(id: number): Promise<Chatbot> {
    return this.makeRequest<Chatbot>(`/${id}/`);
  }

  async createChatbot(data: CreateChatbotRequest): Promise<Chatbot> {
    try {
      // Handle file upload if logo is provided
      if (data.logo) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('system_prompt', data.system_prompt);
        if (data.conversation_limit) {
          formData.append('conversation_limit', data.conversation_limit.toString());
        }
        formData.append('logo', data.logo);
        
        return this.makeRequest<Chatbot>('/', {
          method: 'POST',
          body: formData,
        });
      } else {
        return this.makeRequest<Chatbot>('/', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error('Chatbot endpoints are not available on the backend yet. Please contact your administrator to enable chatbot functionality.');
      }
      throw error;
    }
  }

  async updateChatbot(data: UpdateChatbotRequest): Promise<Chatbot> {
    // Handle file upload if logo is provided
    if (data.logo) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.system_prompt) formData.append('system_prompt', data.system_prompt);
      if (data.conversation_limit) {
        formData.append('conversation_limit', data.conversation_limit.toString());
      }
      formData.append('logo', data.logo);
      
      return this.makeRequest<Chatbot>(`/${data.id}/`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      return this.makeRequest<Chatbot>(`/${data.id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  }

  async patchChatbot(data: UpdateChatbotRequest): Promise<Chatbot> {
    return this.makeRequest<Chatbot>(`/${data.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteChatbot(id: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/${id}/`, {
      method: 'DELETE',
    });
  }

  // Chat Operations
  async sendMessage(chatbotId: number, request: ChatRequest): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>(`/${chatbotId}/chat/`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getConversationMessages(conversationId: number): Promise<ChatMessage[]> {
    return this.makeRequest<ChatMessage[]>(`/conversations/${conversationId}/messages/`);
  }

  // Platform Admin Operations
  async getOrganizationChatbots(organizationId: number): Promise<OrganizationChatbotsResponse> {
    return this.makeRequest<OrganizationChatbotsResponse>('/organization_chatbots/', {
      params: { organization_id: organizationId },
    });
  }

  async getOrganizationsList(): Promise<OrganizationsListResponse> {
    return this.makeRequest<OrganizationsListResponse>('/list_organizations/');
  }

  // API Capability Information
  getSupportedOperations(): {
    read: string[];
    write: string[];
    limitations: string[];
  } {
    return {
      read: [
        'List chatbots',
        'Get chatbot details',
        'Get conversation messages',
        'Get organization chatbots (Platform Admin)',
        'List organizations (Platform Admin)',
      ],
      write: [
        'Create chatbot',
        'Update chatbot',
        'Delete chatbot',
        'Send chat messages',
      ],
      limitations: [
        'Chat messages are public (no authentication required)',
        'File uploads only supported for logo images',
        'Conversation limits are enforced per chatbot',
        'Platform admin endpoints require special permissions',
      ],
    };
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService(); 