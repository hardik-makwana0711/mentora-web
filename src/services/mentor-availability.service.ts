import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export type TimeRange = { startTime: string; endTime: string };

export type WeeklyAvailabilityDay = {
  dayOfWeek: number;
  ranges: TimeRange[];
};

export type AvailabilityOverride =
  | { date: string; kind: 'unavailable' }
  | { date: string; kind: 'custom_hours'; ranges: TimeRange[] };

export type MentorAvailabilityPayload = {
  weeklyAvailability: WeeklyAvailabilityDay[];
  overrides: AvailabilityOverride[];
};

export type CalendarDay = {
  date: string;
  availableSlots: { start: string; end: string }[];
  bookedSlots: { bookingId: string; listingId: null; start: string; end: string; status: string }[];
};

export type MentorCalendarResponse = {
  mentorId: string;
  calendar: CalendarDay[];
};

const noCache = {
  headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
} as const;

export async function fetchMentorAvailability(): Promise<MentorAvailabilityPayload> {
  const { data } = await apiClient.get<MentorAvailabilityPayload>(endpoints.mentor.availability, {
    ...noCache,
    params: { _t: Date.now() },
  });
  return data;
}

export async function fetchMentorCalendar(startDate: string, endDate: string): Promise<MentorCalendarResponse> {
  const { data } = await apiClient.get<MentorCalendarResponse>(endpoints.mentor.calendar, {
    ...noCache,
    params: { startDate, endDate, _t: Date.now() },
  });
  return data;
}

export async function putMentorAvailability(body: MentorAvailabilityPayload): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.put<{ success: boolean; message: string }>(endpoints.mentor.availability, body);
  return data;
}
