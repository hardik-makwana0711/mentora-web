import { format } from 'date-fns';
import { getDateFnsLocale } from '@/lib/date-locale';
import { Badge } from '@/components/ui/Badge';
import { LessonJoinButton } from '@/features/lessons/components/LessonJoinButton';
import { MeetingStatusSection } from '@/features/lessons/components/MeetingStatusSection';
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
    <li className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)]/40 p-3">
      <button
        type="button"
        onClick={onViewPress}
        className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
      >
        <span className="font-medium text-[var(--color-m-text)]">{item.subject}</span>
        <span className="text-sm text-[var(--color-text-secondary)]">{item.student_name}</span>
        <Badge>{format(new Date(item.start_time), 'HH:mm', { locale: getDateFnsLocale() })}</Badge>
      </button>
      <MeetingStatusSection session={joinSession} className="mt-2 px-0.5" />
      <div className="mt-2">
        <LessonJoinButton session={joinSession} size="sm" />
      </div>
    </li>
  );
}
