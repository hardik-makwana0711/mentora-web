import { format } from 'date-fns';
import { getDateFnsLocale } from '@/lib/date-locale';
import { LessonJoinButton } from '@/features/lessons/components/LessonJoinButton';
import { MeetingStatusSection } from '@/features/lessons/components/MeetingStatusSection';
import { formatSubject } from '@/features/search/lib/format-labels';
import type { MentorScheduleItem } from '@/types/dashboard';
import type { JoinableSession } from '@/types/sessions';

type MentorScheduleRowProps = {
  item: MentorScheduleItem;
  onViewPress?: () => void;
};

function toJoinable(item: MentorScheduleItem): JoinableSession {
  return {
    session_id: item.session_id,
    meeting_status: item.meeting_status ?? undefined,
    meeting_url: item.meeting_url,
    can_join: item.can_join,
    meeting_provider: item.meeting_provider,
  };
}

export function MentorScheduleRow({ item, onViewPress }: MentorScheduleRowProps) {
  const joinSession = toJoinable(item);

  return (
    <li className="rounded-[var(--radius-m-card)] border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-3">
      <button
        type="button"
        onClick={onViewPress}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="min-w-[64px] rounded-[var(--radius-m-button)] bg-[var(--color-m-primary-soft)] px-2 py-2.5 text-center text-sm font-extrabold text-[var(--color-m-primary-text)]">
          {format(new Date(item.start_time), 'HH:mm', { locale: getDateFnsLocale() })}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold text-[var(--color-m-text)]">
            {formatSubject(item.subject)}
          </span>
          <span className="block truncate text-sm text-[var(--color-m-text-muted)]">
            {item.student_name}
          </span>
        </span>
      </button>
      <MeetingStatusSection session={joinSession} className="mt-2 px-0.5" />
      <div className="mt-2">
        <LessonJoinButton session={joinSession} size="sm" />
      </div>
    </li>
  );
}
