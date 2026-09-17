import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStrings } from '@/constants/strings';
import { useMentorContactRequestsCount } from '@/features/mentor/hooks/useMentorContactRequestsList';
import type { ContactRequestStatus } from '@/types/contact-requests';

function SummaryTile({ status, label }: { status: ContactRequestStatus; label: string }) {
  const countQuery = useMentorContactRequestsCount(status);
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {label}
      </p>
      {countQuery.isPending ? (
        <Skeleton className="mt-2 h-7 w-10" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-[var(--color-m-text)]">{countQuery.data ?? 0}</p>
      )}
    </Card>
  );
}

export function ContactRequestSummaryCards() {
  const tr = useStrings();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryTile status="pending" label={tr.statusPending} />
      <SummaryTile status="accepted" label={tr.statusAccepted} />
      <SummaryTile status="rejected" label={tr.statusRejected} />
      <SummaryTile status="cancelled" label={tr.statusCancelled} />
    </div>
  );
}
