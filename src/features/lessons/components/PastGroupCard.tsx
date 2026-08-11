import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import {
  formatLessonDate,
  formatLessonServiceName,
  formatLessonTime,
  pastGroupSessionCount,
  pastGroupSessionCountLabel,
  pastGroupSubtitle,
  pastGroupTitle,
  reportStatusLabel,
} from '@/features/lessons/lib/lessons-utils';
import type { LessonRole, PastGroupCard as PastGroup } from '@/types/lessons';

type Props = {
  card: PastGroup;
  role: LessonRole;
  onPress: () => void;
};

export function PastGroupCard({ card, role, onPress }: Props) {
  const tr = useStrings();
  const title = formatLessonServiceName(pastGroupTitle(card, role));
  const subtitle = pastGroupSubtitle(card, role);
  const count = pastGroupSessionCount(card);
  const latest = card.next_session_date;
  // TODO: Use real report-ready flags from API when available.
  const reportLabel = reportStatusLabel('unknown');

  const latestLabel = latest
    ? i18n.t('lessonsLastLesson', {
        date: `${formatLessonDate(latest)}${formatLessonTime(latest) ? ` · ${formatLessonTime(latest)}` : ''}`,
      })
    : null;

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full items-stretch gap-3 rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 text-left transition hover:border-[var(--color-brand-primary)]/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-semibold text-[var(--color-m-text)]">{title}</p>
          <Badge variant="warning">{reportLabel}</Badge>
        </div>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">{subtitle}</p>
        ) : null}
        <p className="mt-2 text-sm text-[var(--color-m-text-muted)]">
          {pastGroupSessionCountLabel(count)}
        </p>
        {latestLabel ? (
          <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">{latestLabel}</p>
        ) : null}
        <p className="mt-3 text-sm font-medium text-[var(--color-m-primary-light)]">{tr.viewSessions}</p>
      </div>
      <ChevronRight className="mt-1 size-5 shrink-0 self-center text-[var(--color-m-text-muted)]" />
    </button>
  );
}
