import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { GenerateMeetingLinkResponse, UpcomingSession } from '@/types/sessions';

const noCache = {
  headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
} as const;

export async function fetchUpcomingSessions(): Promise<UpcomingSession[]> {
  const { data } = await apiClient.get<UpcomingSession[]>(endpoints.sessions.upcoming, noCache);
  return data;
}

export async function generateMeetingLink(sessionId: string): Promise<GenerateMeetingLinkResponse> {
  const { data } = await apiClient.post<GenerateMeetingLinkResponse>(
    endpoints.sessions.generateMeetingLink(sessionId),
    {},
  );
  return data;
}
