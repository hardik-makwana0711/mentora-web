import { useStrings } from '@/constants/strings';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';

type Props = {
  todayCount: number;
  weekCount: number;
};

export function MentorWeekPreview({ todayCount, weekCount }: Props) {
  const tr = useStrings();

  const todayLabel =
    todayCount === 0
      ? tr.dashboardNoLessonsToday
      : todayCount === 1
        ? tr.dashboardTodayLessonOne
        : tr.dashboardTodayLessonCount.replace('{{count}}', String(todayCount));

  const weekLabel =
    weekCount === 0
      ? tr.dashboardNoUpcomingThisWeek
      : weekCount === 1
        ? tr.dashboardWeekUpcomingOne
        : tr.dashboardWeekUpcomingCount.replace('{{count}}', String(weekCount));

  return (
    <DashboardPanelCard className="!p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.dashboardTodayPreview}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-m-text)]">{todayLabel}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.dashboardThisWeekPreview}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-m-text)]">{weekLabel}</p>
        </div>
      </div>
    </DashboardPanelCard>
  );
}
