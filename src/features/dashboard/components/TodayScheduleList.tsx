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
      <div className="flex items-center gap-2">
        <p className="text-base font-extrabold tracking-[-0.3px] text-[var(--color-m-text)]">
          {tr.todaySchedule}
        </p>
        <span className="min-w-[26px] rounded-full bg-[var(--color-m-primary-soft)] px-2 py-0.5 text-center text-xs font-bold text-[var(--color-m-primary-text)]">
          {items.length}
        </span>
      </div>
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
