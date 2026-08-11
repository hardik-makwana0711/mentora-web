import { useStrings } from '@/constants/strings';
import type { MentorScheduleItem } from '@/types/dashboard';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';
import { MentorScheduleRow } from '@/features/dashboard/components/MentorScheduleRow';

type UpcomingLessonsListProps = {
  items: MentorScheduleItem[];
  onSessionPress?: (sessionId: string) => void;
};

export function UpcomingLessonsList({ items, onSessionPress }: UpcomingLessonsListProps) {
  const tr = useStrings();
  if (!items.length) return null;

  return (
    <DashboardPanelCard>
      <p className="text-sm text-[var(--color-text-muted)]">{tr.upcomingLesson}</p>
      <ul className="mt-3 space-y-2">
        {items.map((s) => (
          <MentorScheduleRow
            key={s.session_id}
            item={s}
            onViewPress={() => onSessionPress?.(s.session_id)}
          />
        ))}
      </ul>
    </DashboardPanelCard>
  );
}
