import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getDateFnsLocale } from '@/lib/date-locale';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LessonsCalendar } from '@/features/lessons/components/LessonsCalendar';
import { LessonCard } from '@/features/lessons/components/LessonCard';
import {
  calendarDateKey,
  filterSessionsByDate,
  formatLessonDate,
  formatLessonServiceName,
  formatLessonTime,
  sessionScheduledAt,
} from '@/features/lessons/lib/lessons-utils';
import { LessonJoinButton } from '@/features/lessons/components/LessonJoinButton';
import { MeetingStatusSection } from '@/features/lessons/components/MeetingStatusSection';
import { useStrings } from '@/constants/strings';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { cn } from '@/lib/utils';
import type { JoinableSession } from '@/types/sessions';
import type { LessonCalendarSession, LessonRole } from '@/types/lessons';

type Props = {
  sessions: LessonCalendarSession[];
  role: LessonRole;
  onSessionPress: (session: LessonCalendarSession) => void;
  onMessage: (session: LessonCalendarSession) => void;
  onViewPast?: () => void;
};

function toJoinable(session: LessonCalendarSession): JoinableSession {
  return {
    session_id: session.session_id,
    meeting_status: session.meeting_status,
    meeting_url: session.meeting_url,
    can_join: session.can_join,
    meeting_provider: session.meeting_provider,
  };
}

export function UpcomingLessonsTab({
  sessions,
  role,
  onSessionPress,
  onMessage,
  onViewPast,
}: Props) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const today = format(new Date(), 'yyyy-MM-dd');

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ),
    [sessions]
  );

  const initialDate = useMemo(() => {
    if (!sortedSessions.length) return today;
    const future = sortedSessions.find((s) => calendarDateKey(s.scheduled_at) >= today);
    return future ? calendarDateKey(future.scheduled_at) : calendarDateKey(sortedSessions[0].scheduled_at);
  }, [sortedSessions, today]);

  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    if (selectedDate === today && initialDate !== today) setSelectedDate(initialDate);
  }, [initialDate, selectedDate, today]);

  const filtered = useMemo(
    () => filterSessionsByDate(sessions, selectedDate),
    [sessions, selectedDate]
  );

  const sessionDates = useMemo(() => sessions.map((s) => s.scheduled_at), [sessions]);

  const nextSession = sortedSessions.find((s) => calendarDateKey(s.scheduled_at) >= today) ?? sortedSessions[0];

  if (sessions.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed border-[var(--color-m-card-border)] bg-[var(--color-m-card)]/60 px-6 py-10 text-center">
        <CalendarDays className="mb-3 size-8 text-[var(--color-m-text-muted)]" aria-hidden />
        <p className="text-base font-semibold text-[var(--color-m-text)]">{tr.noUpcomingLessons}</p>
        <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
          {role === 'mentor' ? tr.noUpcomingLessonsMentorDescription : tr.noUpcomingLessonsDescription}
        </p>
        {role !== 'mentor' ? (
          <p className="mt-2 text-sm text-[var(--color-m-text-secondary)]">{tr.noUpcomingLessonsHint}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {role === 'parent' || role === 'student' ? (
            <Button type="button" size="sm" onClick={() => navigate(`${roleBase}/search`)}>
              {tr.findMentor}
            </Button>
          ) : null}
          {role === 'mentor' ? (
            <>
              <Button type="button" size="sm" onClick={() => navigate(`${roleBase}/availability`)}>
                {tr.lessonsSetAvailability}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => navigate(`${roleBase}/contact-requests`)}
              >
                {tr.lessonsViewContactRequests}
              </Button>
            </>
          ) : null}
          {onViewPast && role !== 'mentor' ? (
            <Button type="button" size="sm" variant="secondary" onClick={onViewPast}>
              {tr.lessonsViewPastLessons}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const selectedLabel = format(parseISO(`${selectedDate}T12:00:00`), 'd MMMM yyyy, EEEE', {
    locale: getDateFnsLocale(),
  });

  const nextPeople =
    role === 'parent' && nextSession?.student_name && nextSession?.mentor_name
      ? `${nextSession.student_name} · ${nextSession.mentor_name}`
      : role === 'mentor'
        ? nextSession?.student_name
        : nextSession?.mentor_name;

  return (
    <div className="space-y-6">
      {nextSession ? (
        <div className="rounded-2xl border border-[var(--color-m-primary)]/30 bg-gradient-to-br from-[var(--color-m-primary)]/15 to-transparent p-4 ring-1 ring-[var(--color-m-primary)]/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-primary-light)]">
            {tr.lessonsNextUp}
          </p>
          <p className="mt-1 text-lg font-bold text-[var(--color-m-text)]">
            {formatLessonServiceName(nextSession.subject_name)}
          </p>
          {nextPeople ? (
            <p className="mt-0.5 text-sm text-[var(--color-m-text-secondary)]">{nextPeople}</p>
          ) : null}
          <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">
            {formatLessonDate(sessionScheduledAt(nextSession))}
            {sessionScheduledAt(nextSession)
              ? ` · ${formatLessonTime(sessionScheduledAt(nextSession))}`
              : ''}
            {nextSession.duration_minutes != null
              ? ` · ${nextSession.duration_minutes} ${tr.minutesUnit}`
              : ''}
          </p>
          <MeetingStatusSection session={toJoinable(nextSession)} className="mt-2" />
          <div className="mt-3 flex flex-wrap gap-2">
            <LessonJoinButton session={toJoinable(nextSession)} size="sm" />
            <Button type="button" size="sm" variant="secondary" onClick={() => onSessionPress(nextSession)}>
              {tr.lessonsViewDetails}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
        <aside className="mx-auto w-full max-w-sm lg:sticky lg:top-6 lg:mx-0 lg:max-w-none">
          <LessonsCalendar
            sessionDates={sessionDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-[var(--color-m-card-border)] pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                {tr.lessonsSelectedDay}
              </p>
              <h3 className="mt-0.5 text-lg font-semibold capitalize text-[var(--color-m-text)]">
                {selectedLabel}
              </h3>
            </div>
            <span className="rounded-full bg-[var(--color-m-surface-light)] px-3 py-1 text-xs font-semibold text-[var(--color-m-text-secondary)] ring-1 ring-[var(--color-m-card-border)]">
              {filtered.length}{' '}
              {filtered.length === 1 ? tr.lessonsSessionSingular : tr.lessonsSessionPlural}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-6 py-10 text-center">
              <CalendarDays className="mb-3 size-8 text-[var(--color-m-text-muted)]" aria-hidden />
              <p className="font-semibold text-[var(--color-m-text)]">{tr.lessonsNoSessionsThisDay}</p>
              <p className="mt-2 max-w-sm text-sm text-[var(--color-m-text-muted)]">
                {tr.lessonsNoSessionsThisDayHint}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                'lessons-session-scroll space-y-3',
                filtered.length > 3 && 'max-h-[32rem] overflow-y-auto overscroll-y-contain pr-1'
              )}
            >
              {filtered.map((session) => (
                <LessonCard
                  key={session.session_id}
                  session={session}
                  role={role}
                  variant="upcoming"
                  onPress={() => onSessionPress(session)}
                  onMessage={() => onMessage(session)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
