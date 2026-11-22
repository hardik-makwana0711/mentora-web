import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export interface GoogleCalendarStatus {
  /** false when the server has not set up Google Calendar sign-in yet */
  available: boolean;
  connected: boolean;
  needs_reconnect: boolean;
  google_email: string | null;
  connected_at: string | null;
  /** whose calendar new lessons use */
  lessons_use: 'mentor' | 'platform' | 'none';
}

export async function fetchGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
  const { data } = await apiClient.get(endpoints.googleCalendar.status);
  return data as GoogleCalendarStatus;
}

/** Returns Google's consent URL; the browser should navigate to it. */
export async function startGoogleCalendarConnect(): Promise<string> {
  const { data } = await apiClient.post(endpoints.googleCalendar.connect, { return_to: 'web' });
  return (data as { url: string }).url;
}

export async function disconnectGoogleCalendar(): Promise<GoogleCalendarStatus> {
  const { data } = await apiClient.delete(endpoints.googleCalendar.connection);
  return data as GoogleCalendarStatus;
}
