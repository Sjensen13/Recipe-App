import apiClient from './client';

// Get all conversations for the current user
export const getConversations = async () => {
  try {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getMessages = async (conversationId) => {
  try {
    const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (messageData) => {
  try {
    const response = await apiClient.post('/messages/send', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await apiClient.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await apiClient.delete(`/messages/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get('/messages/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
}; 