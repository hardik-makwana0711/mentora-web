import { ChevronRight, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LessonJoinButton } from '@/features/lessons/components/LessonJoinButton';
import { MeetingStatusSection } from '@/features/lessons/components/MeetingStatusSection';
import type { JoinableSession } from '@/types/sessions';
import {
  formatLessonDate,
  formatLessonServiceName,
  formatLessonTime,
  reportStatusLabel,
  sessionScheduledAt,
  sessionStatusFromItem,
  sessionStatusLabel,
  shouldShowReportCta,
} from '@/features/lessons/lib/lessons-utils';
import { isActiveSessionForMeet } from '@/features/lessons/lib/session-meet-utils';
import type { LessonCalendarSession, LessonRole, LessonSessionListItem } from '@/types/lessons';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';

type SessionLike = LessonCalendarSession | LessonSessionListItem;

type Props = {
  session: SessionLike;
  role: LessonRole;
  variant?: 'upcoming' | 'past';
  onPress?: () => void;
  onMessage?: () => void;
  onReport?: () => void;
};

function badgeVariant(status?: string): 'success' | 'danger' | 'warning' | 'default' | 'primary' {
  const s = (status ?? '').toLowerCase();
  if (s === 'completed') return 'success';
  if (s === 'cancelled') return 'danger';
  if (s === 'in_progress') return 'primary';
  return 'default';
}

export function LessonCard({
  session,
  role,
  variant = 'upcoming',
  onPress,
  onMessage,
  onReport,
}: Props) {
  const tr = useStrings();
  const isMentor = role === 'mentor';
  const isParent = role === 'parent';
  const scheduled = sessionScheduledAt(session);
  const status =
    'status' in session && session.status
      ? session.status
      : sessionStatusFromItem(session as LessonSessionListItem);

  const studentName = 'student_name' in session ? session.student_name : undefined;
  const mentorName = 'mentor_name' in session ? session.mentor_name : undefined;
  const subject = formatLessonServiceName(session.subject_name);
  const topic = 'topic' in session ? session.topic : undefined;
  const duration =
    'duration_minutes' in session && session.duration_minutes != null
      ? session.duration_minutes
      : undefined;

  const peopleLine = isMentor
    ? studentName
    : isParent && studentName && mentorName
      ? `${studentName} · ${mentorName}`
      : mentorName ?? studentName;

  const joinSession: JoinableSession | null =
    variant === 'upcoming' &&
    isActiveSessionForMeet(status) &&
    'session_id' in session
      ? {
          session_id: session.session_id,
          meeting_status: 'meeting_status' in session ? session.meeting_status : undefined,
          meeting_url: 'meeting_url' in session ? session.meeting_url : undefined,
          can_join: 'can_join' in session ? session.can_join : undefined,
          meeting_provider: 'meeting_provider' in session ? session.meeting_provider : undefined,
        }
      : null;

  const reportCta = variant === 'past' ? shouldShowReportCta(status) : 'hide';
  const reportStatus =
    variant === 'past'
      ? reportStatusLabel(
          status?.toLowerCase() === 'completed'
            ? 'processing'
            : status?.toLowerCase() === 'cancelled'
              ? 'none'
              : status?.toLowerCase() === 'scheduled' || status?.toLowerCase() === 'rescheduled'
                ? 'waiting_lesson'
                : 'unknown'
        )
      : null;

  const body = (
    <div className="flex gap-3">
      <div
        className={cn(
          'w-1 shrink-0 rounded-full',
          status === 'cancelled' ? 'bg-red-500' : 'bg-[var(--color-brand-primary)]'
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-[var(--color-m-text)]">{subject}</p>
            {peopleLine ? (
              <p className="mt-0.5 text-sm text-[var(--color-m-text-secondary)]">{peopleLine}</p>
            ) : null}
            {topic ? <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">{topic}</p> : null}
          </div>
          {status ? (
            <Badge variant={badgeVariant(status)}>{sessionStatusLabel(status)}</Badge>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-[var(--color-m-text-muted)]">
          {formatLessonDate(scheduled)}
          {scheduled && formatLessonTime(scheduled) ? ` · ${formatLessonTime(scheduled)}` : ''}
          {duration != null ? ` · ${duration} ${tr.minutesUnit}` : ''}
        </p>

        {reportStatus ? (
          <div className="mt-2">
            <Badge variant="warning">{reportStatus}</Badge>
          </div>
        ) : null}

        {variant === 'upcoming' && joinSession ? (
          <>
            <MeetingStatusSection session={joinSession} className="mt-2" />
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <LessonJoinButton session={joinSession} size="sm" />
              </span>
              {onMessage ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessage();
                  }}
                >
                  <MessageCircle className="size-4" />
                  {tr.messageButton}
                </Button>
              ) : null}
              {onPress ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPress();
                  }}
                >
                  {tr.lessonsViewDetails}
                </Button>
              ) : null}
            </div>
          </>
        ) : variant === 'upcoming' && onPress ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {onMessage ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage();
                }}
              >
                <MessageCircle className="size-4" />
                {tr.messageButton}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onPress();
              }}
            >
              {tr.lessonsViewDetails}
            </Button>
          </div>
        ) : onReport && reportCta !== 'hide' ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-3"
            onClick={(e) => {
              e.stopPropagation();
              onReport();
            }}
          >
            {reportCta === 'report' ? tr.viewReport : tr.viewReportStatus}
            <ChevronRight className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );

  const shellClass =
    'rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 transition hover:border-[var(--color-brand-primary)]/40';
  const hasNestedActions = Boolean(joinSession || onMessage || onReport || onPress);
  const cardClickHandler = onPress ?? (reportCta !== 'hide' ? onReport : undefined);

  if (cardClickHandler && !hasNestedActions) {
    return (
      <button type="button" onClick={cardClickHandler} className={cn(shellClass, 'w-full text-left')}>
        {body}
      </button>
    );
  }

  if (cardClickHandler) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={cardClickHandler}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cardClickHandler();
          }
        }}
        className={cn(shellClass, 'w-full cursor-pointer text-left')}
      >
        {body}
      </div>
    );
  }

  return <div className={shellClass}>{body}</div>;
}
