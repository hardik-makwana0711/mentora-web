import { useState } from 'react';
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
import { ReasonModal } from '@/features/admin/components/ReasonModal';
import { contactRequestsService } from '@/services/contact-requests.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import type { ContactRequest } from '@/types/contact-requests';

export default function MentorContactRequestsPage() {
  const tr = useStrings();
  const qc = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: qk.mentorContactRequests({}),
    queryFn: () => contactRequestsService.listMentorIncoming({ limit: 50 }),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => contactRequestsService.accept(id),
    onSuccess: () => {
      toast.success(tr.requestAccepted);
      void qc.invalidateQueries({ queryKey: qk.mentorContactRequests({}) });
    },
    onError: () => toast.error(tr.actionFailed),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      contactRequestsService.reject(id, message),
    onSuccess: () => {
      toast.success(tr.requestRejected);
      setRejectId(null);
      void qc.invalidateQueries({ queryKey: qk.mentorContactRequests({}) });
    },
    onError: () => toast.error(tr.actionFailed),
  });

  const locale = getDateFnsLocale();

  const renderCard = (item: ContactRequest) => (
    <Card key={item.id} className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-[var(--color-m-text)]">
            {item.requester?.name ?? tr.roleStudent}
            {item.student ? ` (${item.student.name})` : ''}
          </h3>
          <p className="text-sm text-[var(--color-m-text-muted)]">
            {item.subject ?? tr.notProvided} · {item.gradeLevel ?? '—'}
          </p>
        </div>
        <Badge variant={item.status === 'pending' ? 'warning' : 'info'}>{item.status}</Badge>
      </div>
      {item.message ? (
        <p className="mt-3 text-sm text-[var(--color-m-text-secondary)]">{item.message}</p>
      ) : null}
      <p className="mt-2 text-xs text-[var(--color-m-text-muted)]">
        {format(new Date(item.createdAt), 'PPp', { locale })}
      </p>
      {item.status === 'pending' ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate(item.id)}
          >
            {tr.acceptRequest}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setRejectId(item.id)}>
            {tr.rejectRequestBtn}
          </Button>
        </div>
      ) : null}
    </Card>
  );

  return (
    <PageContainer>
      <PageHeader title={tr.mentorContactRequests} description={tr.mentorContactRequestsSubtitle} />

      {query.isPending ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : query.isError ? (
        <ErrorState title={tr.loadError} onRetry={() => void query.refetch()} />
      ) : !query.data?.items.length ? (
        <EmptyState title={tr.noIncomingRequests} />
      ) : (
        <div className="space-y-4">{query.data.items.map(renderCard)}</div>
      )}

      <ReasonModal
        open={Boolean(rejectId)}
        title={tr.rejectRequest}
        confirmLabel={tr.rejectRequestBtn}
        onClose={() => setRejectId(null)}
        onConfirm={(reason) => {
          if (rejectId) rejectMutation.mutate({ id: rejectId, message: reason });
        }}
        loading={rejectMutation.isPending}
      />
    </PageContainer>
  );
}
