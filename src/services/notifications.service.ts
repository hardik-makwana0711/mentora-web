import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export type NotificationRow = {
  id: string;
  title?: string;
  body?: string;
  message?: string;
  read?: boolean;
  is_read?: boolean;
  created_at?: string;
  type?: string;
  notification_type?: string;
  related_entity_id?: string;
  related_entity_type?: string;
  thread_id?: string;
  sender_name?: string;
  sender_id?: string;
};

function normalizeNotification(row: NotificationRow): NotificationRow {
  return {
    ...row,
    type: row.type ?? row.notification_type,
    is_read: row.is_read ?? row.read,
    body: row.body ?? row.message,
  };
}

export const notificationsService = {
  async list(): Promise<NotificationRow[]> {
    try {
      const { data } = await apiClient.get<unknown>(endpoints.notifications.list);
      let rows: NotificationRow[] = [];
      if (Array.isArray(data)) rows = data as NotificationRow[];
      else if (data && typeof data === 'object' && 'notifications' in data && Array.isArray((data as { notifications: unknown }).notifications)) {
        rows = (data as { notifications: NotificationRow[] }).notifications;
      }
      return rows.map(normalizeNotification);
    } catch {
      return [];
    }
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(endpoints.notifications.read(id));
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch(endpoints.notifications.readAll);
  },
};
