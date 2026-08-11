import type { LessonCalendarSession } from '@/types/lessons';
import type { UpcomingSession } from '@/types/sessions';

/** Merge Meet fields from `GET /sessions/upcoming` into lessons calendar rows. */
export function enrichCalendarWithUpcoming(
  calendar: LessonCalendarSession[],
  upcoming: UpcomingSession[],
): LessonCalendarSession[] {
  if (!upcoming.length) return calendar;

  const byId = new Map(upcoming.map((s) => [s.id, s]));

  return calendar.map((row) => {
    const match = byId.get(row.session_id);
    if (!match) return row;
    return {
      ...row,
      meeting_status: match.meeting_status,
      meeting_url: match.meeting_url,
      can_join: match.can_join,
      meeting_provider: match.meeting_provider,
      start_time: match.start_time,
      end_time: match.end_time,
    };
  });
}
