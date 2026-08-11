import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { MessageThreadSummary, ThreadMessage, SendMessageInput, ThreadParticipant } from '@/types/messages';

const noCache = {
  headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
  params: { t: Date.now() },
} as const;

function normalizeThread(raw: Record<string, unknown>): MessageThreadSummary {
  const id = String(raw.thread_id ?? raw.id ?? '');
  return {
    id,
    thread_id: id,
    thread_type: (raw.thread_type as MessageThreadSummary['thread_type']) || 'direct',
    lesson_id: (raw.lesson_id as string | null | undefined) ?? null,
    participants: Array.isArray(raw.participants)
      ? (raw.participants as ThreadParticipant[]).map((p) => ({
          user_id: p.user_id,
          role: p.role,
          first_name: p.first_name,
          last_name: p.last_name,
        }))
      : [],
    last_message_at: (raw.last_message_at as string | null) ?? null,
    unread_count: Number(raw.unread_count ?? 0),
  };
}

export async function fetchMessageThreads(): Promise<MessageThreadSummary[]> {
  const { data } = await apiClient.get<unknown>(endpoints.messages.threads, noCache);
  const raw = Array.isArray(data) ? data : [];
  return raw.map((row) => normalizeThread(row as Record<string, unknown>));
}

export async function fetchThreadMessages(threadId: string, limit = 50): Promise<ThreadMessage[]> {
  const { data } = await apiClient.get<unknown>(endpoints.messages.thread(threadId), {
    ...noCache,
    params: { ...noCache.params, limit },
  });
  const rows = Array.isArray(data) ? data : [];
  return rows.map((m) => {
    const row = m as Record<string, unknown>;
    return {
      id: String(row.id ?? row.message_id ?? ''),
      sender_id: String(row.sender_id ?? ''),
      encrypted_payload: String(row.encrypted_payload ?? ''),
      sent_at: String(row.sent_at ?? ''),
      read_at: (row.read_at as string | null | undefined) ?? null,
    };
  });
}

export async function sendMessage(input: SendMessageInput): Promise<ThreadMessage> {
  const { data } = await apiClient.post<ThreadMessage>(endpoints.messages.send, input);
  return data;
}

export async function markMessageRead(messageId: string): Promise<void> {
  await apiClient.patch(endpoints.messages.read, { message_id: messageId });
}

export async function fetchUnreadMessageTotal(): Promise<number> {
  try {
    const { data } = await apiClient.get<unknown>(endpoints.messages.unreadTotal, noCache);
    const row = (data as { total_unread?: number; count?: number }) ?? {};
    return Number(row.total_unread ?? row.count ?? 0);
  } catch {
    return 0;
  }
}
