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
import { reportsService } from '@/services/reports.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import type { ReportStatus } from '@/types/reports';

export default function AdminReportsPage() {
  const tr = useStrings();
  const qc = useQueryClient();
  const [status, setStatus] = useState<ReportStatus | ''>('');

  const query = useQuery({
    queryKey: qk.adminReports({ status }),
    queryFn: () => reportsService.adminList({ limit: 50, status: status || undefined }),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'review' | 'resolve' | 'dismiss' }) => {
      if (action === 'review') return reportsService.adminMarkUnderReview(id);
      if (action === 'resolve') return reportsService.adminResolve(id);
      return reportsService.adminDismiss(id);
    },
    onSuccess: () => {
      toast.success(tr.adminActionSuccess);
      void qc.invalidateQueries({ queryKey: qk.adminReports({ status }) });
    },
    onError: () => toast.error(tr.actionFailed),
  });

  const locale = getDateFnsLocale();

  return (
    <PageContainer>
      <PageHeader title={tr.adminNavReports} description={tr.adminReportsSubtitle} />

      <div className="mb-4 max-w-xs">
        <DropdownSelect
          value={status}
          onChange={(v) => setStatus(v as ReportStatus | '')}
          options={[
            { value: '', label: tr.adminFilterAllStatuses },
            { value: 'open', label: tr.reportStatusOpen },
            { value: 'under_review', label: tr.reportStatusUnderReview },
            { value: 'resolved', label: tr.reportStatusResolved },
            { value: 'dismissed', label: tr.reportStatusDismissed },
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
        <EmptyState title={tr.adminNoReports} />
      ) : (
        <div className="space-y-4">
          {query.data.items.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-[var(--color-m-text)]">
                    {item.targetType} · {item.reasonCategory}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.targetId}</p>
                </div>
                <Badge>{item.status}</Badge>
              </div>
              {item.description ? (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                {format(new Date(item.createdAt), 'PPp', { locale })}
              </p>
              {item.status === 'open' || item.status === 'under_review' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.status === 'open' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => actionMutation.mutate({ id: item.id, action: 'review' })}
                    >
                      {tr.markUnderReview}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => actionMutation.mutate({ id: item.id, action: 'resolve' })}
                  >
                    {tr.resolve}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => actionMutation.mutate({ id: item.id, action: 'dismiss' })}
                  >
                    {tr.dismiss}
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
