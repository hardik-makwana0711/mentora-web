import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  AdminActiveLesson,
  AdminCancelInput,
  AdminCancellation,
  AdminLessonIssue,
  LessonIssueStatus,
} from '@/types/admin-lessons';

/** Admin tools for lesson problems: missed-lesson reports, emergency cancels, cancellation history. */
export const adminLessonsService = {
  async listIssues(status?: LessonIssueStatus): Promise<AdminLessonIssue[]> {
    const { data } = await apiClient.get<{ items: AdminLessonIssue[] }>(
      endpoints.admin.lessons.issues,
      {
        params: status ? { status } : undefined,
      }
    );
    return data.items;
  },

  async resolveIssue(reportId: string, decision: 'confirm' | 'reject', note?: string) {
    const { data } = await apiClient.post(endpoints.admin.lessons.resolveIssue(reportId), {
      decision,
      ...(note ? { note } : {}),
    });
    return data as { report_id: string; status: LessonIssueStatus; credit_refunded?: boolean };
  },

  async listActive(q?: string): Promise<AdminActiveLesson[]> {
    const { data } = await apiClient.get<{ items: AdminActiveLesson[] }>(
      endpoints.admin.lessons.active,
      {
        params: q ? { q } : undefined,
      }
    );
    return data.items;
  },

  async listCancellations(limit = 100): Promise<AdminCancellation[]> {
    const { data } = await apiClient.get<{ items: AdminCancellation[] }>(
      endpoints.admin.lessons.cancellations,
      { params: { limit } }
    );
    return data.items;
  },

  async cancel(sessionId: string, input: AdminCancelInput) {
    const { data } = await apiClient.post(endpoints.admin.lessons.cancel(sessionId), input);
    return data as { session_id: string; credit_refunded: boolean; mentor_paid: boolean };
  },
};
