import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  AiQuizAttemptSubmitRequest,
  AiQuizAttemptSubmitResponse,
  AiQuizGenerateRequest,
  AiQuizGenerateResponse,
  AiQuizMentorResponse,
  AiQuizPatchRequest,
  AiQuizPublishResponse,
  AiQuizResultResponse,
  AiQuizStudentResponse,
  AiSummaryPatchResponse,
  AiSummaryResponse,
} from '@/types/lesson-ai';

const noCache = {
  headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
} as const;

export async function fetchAiSummary(sessionId: string): Promise<AiSummaryResponse> {
  const { data } = await apiClient.get<AiSummaryResponse>(endpoints.sessions.aiSummary(sessionId), noCache);
  return data;
}

export async function patchAiSummary(sessionId: string, summary: string): Promise<AiSummaryPatchResponse> {
  const { data } = await apiClient.patch<AiSummaryPatchResponse>(
    endpoints.sessions.aiSummary(sessionId),
    { summary }
  );
  return data;
}

export async function generateAiSummary(sessionId: string): Promise<AiSummaryResponse> {
  const { data } = await apiClient.post<AiSummaryResponse>(endpoints.sessions.aiSummaryGenerate(sessionId));
  return data;
}

export async function generateAiQuiz(
  sessionId: string,
  body: AiQuizGenerateRequest
): Promise<AiQuizGenerateResponse> {
  const { data } = await apiClient.post<AiQuizGenerateResponse>(
    endpoints.sessions.aiQuizGenerate(sessionId),
    body
  );
  return data;
}

export async function fetchAiQuizMentor(sessionId: string): Promise<AiQuizMentorResponse> {
  const { data } = await apiClient.get<AiQuizMentorResponse>(
    endpoints.sessions.aiQuizMentor(sessionId),
    noCache
  );
  return data;
}

export async function fetchAiQuizStudent(sessionId: string): Promise<AiQuizStudentResponse> {
  const { data } = await apiClient.get<AiQuizStudentResponse>(
    endpoints.sessions.aiQuizStudent(sessionId),
    noCache
  );
  return data;
}

export async function patchAiQuiz(quizId: string, body: AiQuizPatchRequest): Promise<AiQuizMentorResponse> {
  const { data } = await apiClient.patch<AiQuizMentorResponse>(endpoints.aiQuizzes.patch(quizId), body);
  return data;
}

export async function publishAiQuiz(quizId: string): Promise<AiQuizPublishResponse> {
  const { data } = await apiClient.post<AiQuizPublishResponse>(endpoints.aiQuizzes.publish(quizId));
  return data;
}

export async function submitAiQuizAttempt(
  quizId: string,
  body: AiQuizAttemptSubmitRequest
): Promise<AiQuizAttemptSubmitResponse> {
  const { data } = await apiClient.post<AiQuizAttemptSubmitResponse>(
    endpoints.aiQuizzes.attempt(quizId),
    body
  );
  return data;
}

export async function fetchAiQuizResult(quizId: string): Promise<AiQuizResultResponse> {
  const { data } = await apiClient.get<AiQuizResultResponse>(endpoints.aiQuizzes.result(quizId), noCache);
  return data;
}
