import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  JoinSessionResponse,
  LessonRole,
  LessonSessionsResponse,
  LessonsDashboardPayload,
  LessonsListResponse,
  LessonListItem,
  MentorNote,
  QuizDetail,
  SessionDetail,
  TranscriptResponse,
  TranscriptStatusResponse,
} from '@/types/lessons';

/** Cache headers only — do not add `t` query param; backend lesson schemas use `.strict()`. */
const noCache = {
  headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
} as const;

export async function fetchLessonsDashboard(
  role: LessonRole,
  options?: { studentId?: string; page?: number; limit?: number }
): Promise<LessonsDashboardPayload> {
  const params: Record<string, string | number> = {};
  if (role === 'parent') {
    if (options?.studentId) params.student_id = options.studentId;
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;
  }
  const { data } = await apiClient.get<LessonsDashboardPayload>(endpoints.lessons.dashboard(role), {
    ...noCache,
    params: Object.keys(params).length ? params : undefined,
  });
  return data;
}

export async function fetchLessonsList(page = 1, limit = 50): Promise<LessonsListResponse> {
  const { data } = await apiClient.get<LessonsListResponse>(endpoints.lessons.list, {
    ...noCache,
    params: { page, limit },
  });
  return data;
}

export async function fetchLessonDetail(lessonId: string): Promise<LessonListItem> {
  const { data } = await apiClient.get<LessonListItem>(endpoints.lessons.detail(lessonId), noCache);
  return data;
}

export async function fetchLessonSessions(
  lessonId: string,
  tab: 'upcoming' | 'past',
  page = 1,
  limit = 20
): Promise<LessonSessionsResponse> {
  const { data } = await apiClient.get<LessonSessionsResponse>(endpoints.lessons.sessions(lessonId), {
    ...noCache,
    params: { tab, page, limit },
  });
  return data;
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  const { data } = await apiClient.get<SessionDetail>(endpoints.sessions.detail(sessionId), noCache);
  return data;
}

export async function fetchTranscriptStatus(sessionId: string): Promise<TranscriptStatusResponse> {
  const { data } = await apiClient.get<TranscriptStatusResponse>(
    endpoints.sessions.transcriptStatus(sessionId),
    noCache
  );
  return data;
}

export async function fetchTranscript(sessionId: string): Promise<TranscriptResponse> {
  const { data } = await apiClient.get<TranscriptResponse>(endpoints.sessions.transcript(sessionId), noCache);
  return data;
}

export async function submitTranscriptConsent(
  sessionId: string,
  accepted: boolean
): Promise<TranscriptStatusResponse> {
  const { data } = await apiClient.post<TranscriptStatusResponse>(
    endpoints.sessions.transcriptConsent(sessionId),
    { accepted }
  );
  return data;
}

export async function completeSession(sessionId: string): Promise<{ session_id: string; status: string }> {
  const { data } = await apiClient.post<{ session_id: string; status: string }>(
    endpoints.sessions.complete(sessionId)
  );
  return data;
}

export async function joinSession(sessionId: string): Promise<JoinSessionResponse> {
  const { data } = await apiClient.post<JoinSessionResponse>(
    endpoints.sessions.join(sessionId),
    { source: 'lessons_module' }
  );
  return data;
}

export async function fetchMentorNote(sessionId: string): Promise<MentorNote | null> {
  try {
    const { data } = await apiClient.get<MentorNote>(endpoints.sessions.mentorNote(sessionId), noCache);
    return data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw err;
  }
}

export async function createMentorNote(sessionId: string, noteContent: string): Promise<MentorNote> {
  const { data } = await apiClient.post<MentorNote>(endpoints.sessions.mentorNote(sessionId), {
    note_content: noteContent,
  });
  return data;
}

export async function updateMentorNote(sessionId: string, noteContent: string): Promise<MentorNote> {
  const { data } = await apiClient.patch<MentorNote>(endpoints.sessions.mentorNote(sessionId), {
    note_content: noteContent,
  });
  return data;
}

export async function fetchQuizDetail(quizId: string): Promise<QuizDetail> {
  const { data } = await apiClient.get<QuizDetail>(endpoints.quizzes.detail(quizId), noCache);
  return data;
}
