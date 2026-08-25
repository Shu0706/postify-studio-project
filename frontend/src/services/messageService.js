import api from './api';

export const messageService = {
  // Get all conversations for the current user
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Get messages in a specific conversation
  getMessages: async (otherUserId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/conversation/${otherUserId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (receiverId, content, messageType = 'text') => {
    const response = await api.post('/messages/send', {
      receiverId,
      content,
      messageType
    });
    return response.data;
  },

  // Mark a message as read
  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // Mark entire conversation as read
  markConversationAsRead: async (otherUserId) => {
    const response = await api.put(`/messages/conversation/${otherUserId}/read`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },

  // Search messages
  searchMessages: async (query, otherUserId = null) => {
    const params = new URLSearchParams({ query });
    if (otherUserId) params.append('otherUserId', otherUserId);
    
    const response = await api.get(`/messages/search?${params}`);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Admin only: Get chat statistics
  getChatStats: async () => {
    const response = await api.get('/messages/admin/stats');
    return response.data;
  }
};

export default messageService;
