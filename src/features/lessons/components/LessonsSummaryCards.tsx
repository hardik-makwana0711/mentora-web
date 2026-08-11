import { CalendarClock, CheckCircle2, Clock3, FileText } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import type { LessonsSummaryStats } from '@/features/lessons/lib/lessons-utils';
import type { LessonRole } from '@/types/lessons';

type Props = {
  stats: LessonsSummaryStats;
  role?: LessonRole;
  className?: string;
};

export function LessonsSummaryCards({ stats, role, className }: Props) {
  const tr = useStrings();
  const isMentor = role === 'mentor';

  const cards = isMentor
    ? [
        {
          key: 'today',
          label: tr.lessonsStatToday,
          value: String(stats.todayCount ?? 0),
          hint: null as string | null,
          icon: Clock3,
        },
        {
          key: 'upcoming',
          label: tr.lessonsStatUpcoming,
          value: String(stats.upcomingCount),
          hint: null,
          icon: CalendarClock,
        },
        {
          key: 'completed',
          label: tr.lessonsStatCompleted,
          value: String(stats.completedCount),
          hint: null,
          icon: CheckCircle2,
        },
        {
          key: 'reports',
          label: tr.lessonsStatReportsPending,
          // TODO: reports-pending count is not exposed by the dashboard API yet.
          value: stats.reportsPendingCount == null ? '—' : String(stats.reportsPendingCount),
          hint: stats.reportsPendingCount == null ? tr.lessonsStatNoDataYet : null,
          icon: FileText,
        },
      ]
    : [
        {
          key: 'upcoming',
          label: tr.lessonsStatUpcoming,
          value: String(stats.upcomingCount),
          hint: null as string | null,
          icon: CalendarClock,
        },
        {
          key: 'completed',
          label: tr.lessonsStatCompleted,
          value: String(stats.completedCount),
          hint: null,
          icon: CheckCircle2,
        },
        {
          key: 'reports',
          label: tr.lessonsStatReportsReady,
          value: stats.reportsReadyCount == null ? '0' : String(stats.reportsReadyCount),
          hint: stats.reportsReadyCount == null ? tr.lessonsStatNoDataYet : null,
          icon: FileText,
        },
        {
          key: 'hours',
          label: tr.lessonsStatTotalHours,
          value: stats.totalHours == null ? '0' : String(stats.totalHours),
          hint: stats.totalHours == null ? tr.lessonsStatNoDataYet : tr.lessonsHoursUnit,
          icon: Clock3,
        },
      ];

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4',
        className
      )}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3 ring-1 ring-[var(--color-m-ring-subtle)]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-m-primary)]/12 text-[var(--color-m-primary-light)]">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[var(--color-m-text-muted)]">{card.label}</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--color-m-text)]">
                {card.value}
                {card.key === 'hours' && stats.totalHours != null ? (
                  <span className="ml-1 text-sm font-medium text-[var(--color-m-text-secondary)]">
                    {tr.lessonsHoursUnit}
                  </span>
                ) : null}
              </p>
              {card.hint && (card.key !== 'hours' || stats.totalHours == null) ? (
                <p className="mt-0.5 text-[11px] text-[var(--color-m-text-muted)]">{card.hint}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
