import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { contactRequestsService } from '@/services/contact-requests.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import type { ContactRequest, ContactRequestStatus } from '@/types/contact-requests';

function statusVariant(status: ContactRequestStatus) {
  switch (status) {
    case 'accepted':
    case 'completed':
      return 'success' as const;
    case 'rejected':
    case 'cancelled':
      return 'danger' as const;
    case 'pending':
      return 'warning' as const;
    default:
      return 'info' as const;
  }
}

function RequestCard({
  item,
  onCancel,
  busy,
}: {
  item: ContactRequest;
  onCancel: () => void;
  busy: boolean;
}) {
  const tr = useStrings();
  const locale = getDateFnsLocale();
  const typeLabels: Record<string, string> = {
    contact: tr.requestTypeContact,
    trial: tr.requestTypeTrial,
    regular_lesson: tr.requestTypeRegular,
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-[var(--color-m-text)]">{item.mentor?.name ?? tr.mentorLabel}</h3>
          <p className="text-sm text-[var(--color-m-text-muted)]">
            {typeLabels[item.requestType] ?? item.requestType}
            {item.subject ? ` · ${item.subject}` : ''}
          </p>
        </div>
        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
      </div>
      {item.message ? (
        <p className="mt-3 line-clamp-2 text-sm text-[var(--color-m-text-secondary)]">{item.message}</p>
      ) : null}
      <p className="mt-3 text-xs text-[var(--color-m-text-muted)]">
        {tr.created}: {format(new Date(item.createdAt), 'PP', { locale })}
      </p>
      {item.status === 'pending' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3"
          isLoading={busy}
          onClick={onCancel}
        >
          {tr.cancelRequest}
        </Button>
      ) : null}
    </Card>
  );
}

export default function MyMentorRequestsPage() {
  const tr = useStrings();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.myContactRequests({}),
    queryFn: () => contactRequestsService.listMine({ limit: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => contactRequestsService.cancel(id),
    onSuccess: () => {
      toast.success(tr.requestCancelled);
      void qc.invalidateQueries({ queryKey: qk.myContactRequests({}) });
    },
    onError: () => toast.error(tr.actionFailed),
  });

  return (
    <PageContainer>
      <PageHeader title={tr.myMentorRequests} description={tr.myMentorRequestsSubtitle} />

      {query.isPending ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : query.isError ? (
        <ErrorState title={tr.loadError} onRetry={() => void query.refetch()} />
      ) : !query.data?.items.length ? (
        <EmptyState title={tr.noMentorRequests} description={tr.noMentorRequestsHint} />
      ) : (
        <div className="space-y-4">
          {query.data.items.map((item) => (
            <RequestCard
              key={item.id}
              item={item}
              busy={cancelMutation.isPending}
              onCancel={() => cancelMutation.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
