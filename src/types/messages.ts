export type MessageThreadType = 'direct' | 'lesson';

export type ThreadParticipant = {
  user_id: string;
  role: string;
  first_name: string;
  last_name: string;
};

export type MessageThreadSummary = {
  id: string;
  thread_id: string;
  thread_type: MessageThreadType;
  lesson_id?: string | null;
  participants: ThreadParticipant[];
  last_message_at: string | null;
  unread_count: number;
};

export type ThreadMessage = {
  id: string;
  sender_id: string;
  encrypted_payload: string;
  sent_at: string;
  read_at?: string | null;
};

export type SendMessageInput = {
  thread_id: string;
  receiver_id?: string;
  message_type: 'text' | 'system';
  encrypted_payload: string;
};
