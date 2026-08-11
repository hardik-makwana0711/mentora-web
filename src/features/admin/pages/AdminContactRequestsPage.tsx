import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { contactRequestsService } from '@/services/contact-requests.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import type { ContactRequestStatus } from '@/types/contact-requests';

export default function AdminContactRequestsPage() {
  const tr = useStrings();
  const qc = useQueryClient();
  const [status, setStatus] = useState<ContactRequestStatus | ''>('');

  const query = useQuery({
    queryKey: qk.adminContactRequests({ status }),
    queryFn: () =>
      contactRequestsService.adminList({
        limit: 50,
        status: status || undefined,
      }),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: ContactRequestStatus }) =>
      contactRequestsService.adminUpdateStatus(id, next),
    onSuccess: () => {
      toast.success(tr.adminActionSuccess);
      void qc.invalidateQueries({ queryKey: qk.adminContactRequests({ status }) });
    },
    onError: () => toast.error(tr.actionFailed),
  });

  const locale = getDateFnsLocale();

  return (
    <PageContainer>
      <PageHeader title={tr.adminContactRequests} description={tr.adminContactRequestsSubtitle} />

      <div className="mb-4 max-w-xs">
        <DropdownSelect
          value={status}
          onChange={(v) => setStatus(v as ContactRequestStatus | '')}
          options={[
            { value: '', label: tr.adminFilterAllStatuses },
            { value: 'pending', label: tr.statusPending },
            { value: 'accepted', label: tr.statusAccepted },
            { value: 'rejected', label: tr.statusRejected },
            { value: 'cancelled', label: tr.statusCancelled },
            { value: 'completed', label: tr.statusCompleted },
          ]}
        />
      </div>

      {query.isPending ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : query.isError ? (
        <ErrorState title={tr.loadError} onRetry={() => void query.refetch()} />
      ) : !query.data?.items.length ? (
        <EmptyState title={tr.adminNoContactRequests} />
      ) : (
        <div className="space-y-4">
          {query.data.items.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-[var(--color-m-text)]">
                    {item.mentor?.name} ← {item.requester?.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {item.requestType} · {item.subject ?? '—'}
                  </p>
                </div>
                <Badge>{item.status}</Badge>
              </div>
              {item.message ? (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.message}</p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                {format(new Date(item.createdAt), 'PPp', { locale })}
              </p>
              {item.status === 'pending' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => patchMutation.mutate({ id: item.id, next: 'accepted' })}
                  >
                    {tr.acceptRequest}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => patchMutation.mutate({ id: item.id, next: 'rejected' })}
                  >
                    {tr.rejectRequestBtn}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => patchMutation.mutate({ id: item.id, next: 'completed' })}
                  >
                    {tr.markCompleted}
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
