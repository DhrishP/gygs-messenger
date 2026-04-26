import axios from 'axios';

// Change this to the Railway URL when deploying or use local IP for emulator
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/chat';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws/chat';

export const api = axios.create({
  baseURL: API_URL,
});

export const registerUser = async (userId: string) => {
  const response = await api.post('/register/', { user_id: userId });
  return response.data;
};

export const getConversations = async (userId: string) => {
  const response = await api.get(`/conversations/?user_id=${userId}`);
  return response.data;
};

export const createConversation = async (userId: string, otherUserId: string) => {
  const response = await api.post('/conversations/', { user_id: userId, other_user_id: otherUserId });
  return response.data;
};

export const getMessages = async (conversationId: string) => {
  const response = await api.get(`/messages/${conversationId}/`);
  return response.data;
};

export const markMessageSeen = async (messageId: string, userId: string) => {
  const response = await api.post(`/messages/${messageId}/seen/`, { user_id: userId });
  return response.data;
};

export const deleteMessage = async (messageId: string, userId: string, deleteForEveryone: boolean) => {
  const response = await api.post(`/messages/${messageId}/delete/`, {
    user_id: userId,
    delete_for_everyone: deleteForEveryone,
  });
  return response.data;
};
