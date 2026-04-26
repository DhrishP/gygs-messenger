import axios from 'axios';
import { Conversation, Message } from './types';

// Change this to the Railway URL when deploying or use local IP for emulator
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/chat';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws/chat';

export const api = axios.create({
  baseURL: API_URL,
});

export const registerUser = async (userId: string): Promise<void> => {
  const response = await api.post('/register/', { user_id: userId });
  return response.data;
};

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  const response = await api.get(`/conversations/?user_id=${userId}`);
  return response.data as Conversation[];
};

export const createConversation = async (userId: string, otherUserId: string): Promise<Conversation> => {
  const response = await api.post('/conversations/', { user_id: userId, other_user_id: otherUserId });
  return response.data as Conversation;
};

export const createGroupConversation = async (userId: string, name: string, participantIds: string[]): Promise<Conversation> => {
  const response = await api.post('/groups/', { user_id: userId, name, participant_ids: participantIds });
  return response.data as Conversation;
};

export const getMessages = async (conversationId: string, page: number = 1, size: number = 50): Promise<Message[]> => {
  const response = await api.get(`/messages/${conversationId}/?page=${page}&size=${size}`);
  return response.data.results as Message[];
};

export const markMessageSeen = async (messageId: string, userId: string): Promise<void> => {
  const response = await api.post(`/messages/${messageId}/seen/`, { user_id: userId });
  return response.data;
};

export const deleteMessage = async (messageId: string, userId: string, deleteForEveryone: boolean): Promise<void> => {
  const response = await api.post(`/messages/${messageId}/delete/`, {
    user_id: userId,
    delete_for_everyone: deleteForEveryone,
  });
  return response.data;
};
