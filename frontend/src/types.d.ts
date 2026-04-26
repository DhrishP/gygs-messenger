// src/types.d.ts
export interface User {
  user_id: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  is_group: boolean;
  name?: string;
  last_message?: string;
  last_timestamp?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  seen_by: string[];
  deleted_for: string[];
}
