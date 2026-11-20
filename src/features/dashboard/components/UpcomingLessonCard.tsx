import { format } from 'date-fns';
import { ChevronRight, Clock, User } from 'lucide-react';
import { getDateFnsLocale } from '@/lib/date-locale';
import { useStrings } from '@/constants/strings';
import { Button } from '@/components/ui/Button';
import { LessonJoinButton } from '@/features/lessons/components/LessonJoinButton';
import { MeetingStatusSection } from '@/features/lessons/components/MeetingStatusSection';
import { formatSubject } from '@/features/search/lib/format-labels';
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
        'relative overflow-hidden rounded-[24px] p-6 text-white',
        'bg-[linear-gradient(135deg,var(--color-m-primary),var(--color-m-primary-dark))]',
        '[[data-theme=dark]_&]:bg-[linear-gradient(135deg,var(--color-m-primary-dark),var(--color-m-primary-soft))]',
        'shadow-[0_18px_40px_-18px_var(--color-m-primary)]'
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-20 size-52 rounded-full bg-white/10"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.8px] text-white/70">
          {tr.upcomingLesson}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
          <Clock className="size-3.5" aria-hidden />
          {when}
        </span>
      </div>
      <p className="relative mt-4 text-[26px] font-extrabold leading-tight tracking-[-0.5px] text-white">
        {formatSubject(subject)}
      </p>
      {lessonTopic ? (
        <p className="relative mt-1 text-sm text-white/80">
          {tr.dashboardLessonTopic}: {lessonTopic}
        </p>
      ) : null}
      <div className="relative mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/90">
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
      </div>
      <MeetingStatusSection
        session={joinSession}
        className="relative mt-3 [&_p]:text-white/75"
        showProvider={false}
      />
      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        <LessonJoinButton session={joinSession} size="md" variant="primary" />
        {onViewPress ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/15"
            onClick={onViewPress}
          >
            {tr.dashboardViewDetails}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
