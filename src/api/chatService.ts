import apiClient from './axios.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  language?: string;
  role?: 'buyer' | 'seller' | 'agent' | 'admin' | 'landlord' | 'guest';
  funnelStage?: 'awareness' | 'consideration' | 'decision' | 'post_purchase' | 'listing' | 'managing';
  context?: {
    propertyId?: string;
    filters?: Record<string, unknown>;
    currentPage?: string;
    userAction?: string;
    propertyData?: Record<string, unknown>;
  };
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    conversationId: string;
    messageId: string;
    timestamp: string;
  };
}

export interface ConversationHistory {
  success: boolean;
  data: {
    conversationId: string;
    messages: ChatMessage[];
  };
}

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse['data']> {
    const response = await apiClient.post<ChatResponse>('/ai/chat', request);
    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to send chat message');
    }
    return response.data.data;
  },

  async getHistory(conversationId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ConversationHistory>(
      `/ai/chat/history/${conversationId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to get chat history');
    }
    return response.data.data.messages;
  },

  async clearHistory(conversationId: string): Promise<void> {
    await apiClient.delete(`/ai/chat/history/${conversationId}`);
  },

  async getConversations(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: { conversations: string[] } }>(
      '/ai/chat/conversations'
    );
    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to get conversations');
    }
    return response.data.data.conversations;
  },
};

