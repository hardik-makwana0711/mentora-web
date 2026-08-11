import { format } from 'date-fns';
import { ChevronRight, Clock, User } from 'lucide-react';
import { getDateFnsLocale } from '@/lib/date-locale';
import { useStrings } from '@/constants/strings';
import { Button } from '@/components/ui/Button';
import { LessonJoinButton } from '@/features/lessons/components/LessonJoinButton';
import { MeetingStatusSection } from '@/features/lessons/components/MeetingStatusSection';
import type { JoinableSession } from '@/types/sessions';
import { cn } from '@/lib/utils';

type UpcomingLessonCardProps = {
  mentorName: string;
  subject: string;
  lessonTopic?: string | null;
  studentName?: string | null;
  startTime: string;
  joinSession: JoinableSession;
  onViewPress?: () => void;
};

export function UpcomingLessonCard({
  mentorName,
  subject,
  lessonTopic,
  studentName,
  startTime,
  joinSession,
  onViewPress,
}: UpcomingLessonCardProps) {
  const tr = useStrings();
  const when = format(new Date(startTime), 'EEE d MMM · HH:mm', { locale: getDateFnsLocale() });

  return (
    <div
      className={cn(
        'rounded-[16px] border border-white/25 p-5 text-white',
        'bg-gradient-to-br from-[var(--color-brand-primary)]/90 to-[var(--color-m-gradient-end)]/85',
        'shadow-[var(--shadow-m-glow)]',
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-white/65">{tr.upcomingLesson}</p>
      <p className="mt-2 text-2xl font-bold text-white">{subject}</p>
      {lessonTopic ? (
        <p className="mt-1 text-sm text-white/75">
          {tr.dashboardLessonTopic}: {lessonTopic}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/85">
        {studentName ? (
          <span className="inline-flex items-center gap-1.5">
            <User className="size-4" aria-hidden />
            {studentName}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <User className="size-4" aria-hidden />
          {mentorName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden />
          {when}
        </span>
      </div>
      <MeetingStatusSection
        session={joinSession}
        className="mt-3 [&_p]:text-white/70"
        showProvider={false}
      />
      <div className="mt-5 flex flex-wrap gap-2">
        <LessonJoinButton session={joinSession} size="sm" variant="primary" />
        {onViewPress ? (
          <Button type="button" size="sm" variant="ghost" className="text-white hover:bg-white/15" onClick={onViewPress}>
            {tr.dashboardViewDetails}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
