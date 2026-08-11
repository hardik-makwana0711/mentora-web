import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { Badge } from '@/components/ui/Badge';
import { useStrings } from '@/constants/strings';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';

type StudentCardProps = {
  studentName: string;
  grade: string | null;
  avatarUrl: string | null;
};

export function StudentCard({ studentName, grade, avatarUrl }: StudentCardProps) {
  const tr = useStrings();
  return (
    <DashboardPanelCard>
      <p className="text-sm text-[var(--color-text-muted)]">{tr.linkedStudents}</p>
      <div className="mt-3 flex items-center gap-3">
        <PresignedAvatar storedUrl={avatarUrl} name={studentName} className="size-12" />
        <div>
          <p className="font-semibold text-[var(--color-m-text)]">{studentName}</p>
          {grade ? (
            <Badge className="mt-1">
              {tr.dashboardGrade}: {grade}
            </Badge>
          ) : null}
        </div>
      </div>
    </DashboardPanelCard>
  );
}
