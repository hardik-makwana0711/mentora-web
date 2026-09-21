import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { referencesService } from '@/services/references.service';
import { getDateFnsLocale } from '@/lib/date-locale';
import { useStrings } from '@/constants/strings';
import type { MentorReferenceRow, ReferenceStatus } from '@/types/references';

const TABS: {
  id: ReferenceStatus;
  labelKey: 'referencesTabPending' | 'referencesTabApproved' | 'referencesTabHidden';
}[] = [
  { id: 'pending', labelKey: 'referencesTabPending' },
  { id: 'approved', labelKey: 'referencesTabApproved' },
  { id: 'hidden', labelKey: 'referencesTabHidden' },
];

function statusVariant(status: ReferenceStatus): 'success' | 'warning' | 'default' {
  if (status === 'approved') return 'success';
  if (status === 'pending') return 'warning';
  return 'default';
}

function statusLabelKey(
  status: ReferenceStatus
): 'referencesTabPending' | 'referencesTabApproved' | 'referencesTabHidden' {
  if (status === 'approved') return 'referencesTabApproved';
  if (status === 'hidden') return 'referencesTabHidden';
  return 'referencesTabPending';
}

export default function MentorReferencesPage() {
  const tr = useStrings();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<ReferenceStatus>('pending');

  const query = useQuery({
    queryKey: ['references', 'mentor-inbox'],
    queryFn: () => referencesService.listMentorInbox(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'hidden' }) =>
      referencesService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['references', 'mentor-inbox'] }),
    onError: () => toast.error(tr.referenceUpdateFailed),
  });

  const counts = useMemo(() => {
    const items = query.data ?? [];
    return {
      pending: items.filter((r) => r.status === 'pending').length,
      approved: items.filter((r) => r.status === 'approved').length,
      hidden: items.filter((r) => r.status === 'hidden').length,
    };
  }, [query.data]);

  const visible = (query.data ?? []).filter((r) => r.status === activeTab);

  return (
    <PageContainer>
      <PageHeader title={tr.mentorReferencesTitle} description={tr.mentorReferencesSubtitle} />

      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={
              activeTab === t.id
                ? 'rounded-full bg-[var(--color-m-primary)] px-4 py-1.5 text-sm font-medium text-white'
                : 'rounded-full border border-[var(--color-m-card-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-m-text-secondary)]'
            }
          >
            {tr[t.labelKey]} ({counts[t.id]})
          </button>
        ))}
      </div>

      {query.isPending ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : query.isError ? (
        <ErrorState title={tr.referencesLoadFailed} onRetry={() => void query.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState title={tr.referencesEmpty} />
      ) : (
        <div className="space-y-3">
          {visible.map((r: MentorReferenceRow) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--color-m-text)]">{r.display_name}</p>
                    <Badge variant={statusVariant(r.status)}>{tr[statusLabelKey(r.status)]}</Badge>
                  </div>
                  {r.rating ? (
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < (r.rating ?? 0)
                              ? 'size-3.5 fill-yellow-400 text-yellow-400'
                              : 'size-3.5 text-[var(--color-m-card-border)]'
                          }
                          aria-hidden
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <p className="text-xs text-[var(--color-m-text-muted)]">
                  {format(new Date(r.created_at), 'PP', { locale: getDateFnsLocale() })}
                </p>
              </div>

              {r.title ? (
                <p className="mt-2 text-sm font-medium text-[var(--color-m-text)]">{r.title}</p>
              ) : null}
              <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">{r.content}</p>
              {r.achievement_name ? (
                <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">
                  {r.achievement_name}
                  {r.achievement_year ? ` · ${r.achievement_year}` : ''}
                </p>
              ) : null}

              <div className="mt-3 flex gap-2 border-t border-[var(--color-m-card-border)] pt-3">
                {r.status !== 'approved' ? (
                  <Button
                    type="button"
                    size="sm"
                    isLoading={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: r.id, status: 'approved' })}
                  >
                    {tr.referenceApprove}
                  </Button>
                ) : null}
                {r.status !== 'hidden' ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    isLoading={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: r.id, status: 'hidden' })}
                  >
                    {tr.referenceHide}
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
