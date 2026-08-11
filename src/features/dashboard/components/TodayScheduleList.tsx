import { useStrings } from '@/constants/strings';
import type { MentorScheduleItem } from '@/types/dashboard';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';
import { MentorScheduleRow } from '@/features/dashboard/components/MentorScheduleRow';

type TodayScheduleListProps = {
  items: MentorScheduleItem[];
  onSessionPress?: (sessionId: string) => void;
};

export function TodayScheduleList({ items, onSessionPress }: TodayScheduleListProps) {
  const tr = useStrings();
  return (
    <DashboardPanelCard>
      <p className="text-sm text-[var(--color-text-muted)]">{tr.todaySchedule}</p>
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
