import { Link, useSearchParams } from 'react-router-dom';

import { useMemo, useState } from 'react';

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { Plus, Search } from 'lucide-react';

import { toast } from 'sonner';

import type { AxiosError } from 'axios';

import { PageContainer } from '@/components/layouts/PageContainer';

import { PageHeader } from '@/components/ui/PageHeader';

import { ErrorState } from '@/components/ui/ErrorState';

import { EmptyState } from '@/components/ui/EmptyState';

import { DataTable } from '@/components/ui/DataTable';

import { Skeleton } from '@/components/ui/Skeleton';

import { DropdownSelect } from '@/components/ui/DropdownSelect';

import { AdminPagination } from '@/features/admin/components/AdminPagination';

import { CampaignStatusBadge } from '@/features/admin/components/CampaignStatusBadge';

import { CampaignRowActions } from '@/features/admin/components/CampaignRowActions';

import { ConfirmModal } from '@/features/admin/components/ConfirmModal';

import {

  formatCampaignDate,

  formatCtr,

  getLanguageLabel,

  PLACEMENT_LABEL_KEYS,

  ROLE_LABEL_KEYS,

} from '@/features/admin/lib/marketing-labels';

import { adminMarketingService } from '@/services/admin-marketing.service';

import { qk } from '@/constants/query-keys';

import { useStrings } from '@/constants/strings';

import { adminLinkButtonClass } from '@/features/admin/lib/admin-ui';

import { getDateFnsLocale } from '@/lib/date-locale';

import type { SponsoredCampaign, SponsoredCampaignStatus } from '@/types/marketing';



function normAxios(e: unknown, fallback: string): string {

  const ax = e as AxiosError & { normalizedMessage?: string };

  return ax.normalizedMessage || ax.message || fallback;

}



export default function AdminMarketingCampaignsPage() {

  const tr = useStrings();

  const dateLocale = getDateFnsLocale();

  const qc = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') ?? '');



  const page = Number(searchParams.get('page') ?? '1');

  const status = (searchParams.get('status') as SponsoredCampaignStatus | null) ?? undefined;



  const filters = useMemo(

    () => ({

      page,

      limit: 20,

      status,

      search: searchParams.get('search') ?? undefined,

      sortBy: 'created_at' as const,

      sortOrder: 'desc' as const,

    }),

    [page, status, searchParams]

  );



  const query = useQuery({

    queryKey: qk.adminMarketingCampaigns(filters),

    queryFn: () => adminMarketingService.listCampaigns(filters),

  });



  const metricsQueries = useQueries({

    queries: (query.data?.items ?? []).map((campaign) => ({

      queryKey: qk.adminMarketingCampaignMetrics(campaign.id, {}),

      queryFn: () => adminMarketingService.getCampaignMetrics(campaign.id),

      enabled: !!query.data?.items.length,

      staleTime: 60_000,

    })),

  });



  const metricsById = useMemo(() => {

    const map = new Map<string, { impressions: number; clicks: number; ctr: number }>();

    (query.data?.items ?? []).forEach((campaign, idx) => {

      const m = metricsQueries[idx]?.data?.totals;

      if (m) map.set(campaign.id, m);

    });

    return map;

  }, [query.data?.items, metricsQueries]);



  const statusMutation = useMutation({

    mutationFn: ({ id, status: next }: { id: string; status: SponsoredCampaignStatus }) =>

      adminMarketingService.updateCampaign(id, { status: next }),

    onSuccess: () => {

      toast.success(tr.adminActionSuccess);

      void qc.invalidateQueries({ queryKey: ['admin', 'marketing'] });

    },

    onError: (e) => toast.error(normAxios(e, tr.actionFailed)),

  });



  const endMutation = useMutation({

    mutationFn: (id: string) => {

      const today = new Date().toISOString().slice(0, 10);

      return adminMarketingService.updateCampaign(id, { status: 'paused', endDate: today });

    },

    onSuccess: () => {

      toast.success(tr.marketingCampaignEnded);

      void qc.invalidateQueries({ queryKey: ['admin', 'marketing'] });

    },

    onError: (e) => toast.error(normAxios(e, tr.actionFailed)),

  });



  const deleteMutation = useMutation({

    mutationFn: (id: string) => adminMarketingService.deleteCampaign(id),

    onSuccess: () => {

      toast.success(tr.marketingCampaignDeleted);

      setDeleteId(null);

      void qc.invalidateQueries({ queryKey: ['admin', 'marketing'] });

    },

    onError: (e) => toast.error(normAxios(e, tr.actionFailed)),

  });



  function updateParams(patch: Record<string, string | undefined>) {

    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([k, v]) => {

      if (!v) next.delete(k);

      else next.set(k, v);

    });

    setSearchParams(next);

  }



  function applySearch() {

    updateParams({ search: searchDraft.trim() || undefined, page: '1' });

  }



  if (query.isPending) {

    return (

      <PageContainer width="full">

        <PageHeader title={tr.adminNavMarketing} />

        <Skeleton className="h-64 w-full rounded-2xl" />

      </PageContainer>

    );

  }



  if (query.isError || !query.data) {

    return (

      <PageContainer width="full">

        <ErrorState title={tr.marketingCampaignsLoadError} onRetry={() => void query.refetch()} />

      </PageContainer>

    );

  }



  return (

    <PageContainer width="full">

      <PageHeader

        title={tr.adminNavMarketing}

        description={tr.marketingCampaignsSubtitle}

        actions={

          <Link to="/admin/marketing/new" className={adminLinkButtonClass}>

            <Plus className="mr-1 inline size-4" aria-hidden />

            {tr.marketingCreateCampaign}

          </Link>

        }

      />



      <div className="mb-4 flex flex-wrap items-center gap-3">

        <div className="relative w-full max-w-sm">

          <Search

            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-m-text-muted)]"

            aria-hidden

          />

          <input

            type="search"

            value={searchDraft}

            placeholder={tr.searchPlaceholder}

            className="h-9 w-full rounded-lg border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] py-0 pl-9 pr-3 text-sm text-[var(--color-m-text)] outline-none transition-colors placeholder:text-[var(--color-m-text-muted)] focus:border-[var(--color-m-primary)] focus:bg-[var(--color-m-surface-elevated)]"

            onChange={(e) => setSearchDraft(e.target.value)}

            onKeyDown={(e) => {

              if (e.key === 'Enter') applySearch();

            }}

          />

        </div>

        <DropdownSelect

          className="mb-0 w-[200px]"

          value={status ?? ''}

          onChange={(v) => updateParams({ status: v || undefined, page: '1' })}

          options={[

            { value: '', label: tr.adminFilterAllStatuses },

            { value: 'draft', label: tr.marketingStatusDraft },

            { value: 'active', label: tr.marketingStatusActive },

            { value: 'paused', label: tr.marketingStatusPaused },

          ]}

        />

      </div>



      <DataTable<SponsoredCampaign>

        rows={query.data.items}

        empty={<EmptyState title={tr.marketingCampaignsEmpty} />}

        columns={[

          {

            key: 'name',

            header: tr.marketingColCampaignName,

            render: (row) => (

              <Link

                to={`/admin/marketing/${row.id}`}

                className="group block min-w-[140px] no-underline"

              >

                <p className="font-medium text-[var(--color-m-text)] group-hover:text-[var(--color-m-primary)]">

                  {row.internalName}

                </p>

                <p className="text-xs text-[var(--color-m-text-muted)]">{row.title}</p>

              </Link>

            ),

          },

          {

            key: 'sponsor',

            header: tr.marketingColSponsor,

            render: (row) => <span className="whitespace-nowrap">{row.sponsorLabel ?? '—'}</span>,

          },

          {

            key: 'status',

            header: tr.adminColModerationStatus,

            render: (row) => <CampaignStatusBadge status={row.status} endDate={row.endDate} />,

          },

          {

            key: 'dates',

            header: tr.marketingColDates,

            render: (row) => (

              <span className="whitespace-nowrap text-xs">

                {formatCampaignDate(row.startDate, dateLocale)} –{' '}

                {formatCampaignDate(row.endDate, dateLocale)}

              </span>

            ),

          },

          {

            key: 'language',

            header: tr.marketingFieldLanguage,

            render: (row) => (

              <span className="whitespace-nowrap">{getLanguageLabel(tr, row.language)}</span>

            ),

          },

          {

            key: 'placements',

            header: tr.marketingColPlacements,

            render: (row) => {

              const labels = row.placements.map(

                (p) => tr[PLACEMENT_LABEL_KEYS[p] as keyof typeof tr] as string

              );

              const summary = labels[0] ?? '—';

              const extra = labels.length - 1;

              return (

                <span className="text-xs" title={labels.join(', ')}>

                  {summary}

                  {extra > 0 ? (

                    <span className="ml-1 rounded-md bg-[color-mix(in_srgb,var(--color-m-text)_8%,transparent)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-m-text-muted)]">

                      +{extra}

                    </span>

                  ) : null}

                </span>

              );

            },

          },

          {

            key: 'roles',

            header: tr.marketingColRoles,

            className: 'hidden xl:table-cell',

            render: (row) => (

              <span className="text-xs">

                {row.roles.map((r) => tr[ROLE_LABEL_KEYS[r] as keyof typeof tr] as string).join(', ')}

              </span>

            ),

          },

          {

            key: 'performance',

            header: tr.marketingColPerformance,

            render: (row) => {

              const m = metricsById.get(row.id);

              if (!m) return <span className="text-[var(--color-m-text-muted)]">—</span>;

              return (

                <div className="min-w-[108px] text-xs tabular-nums">

                  <p>

                    <span className="text-[var(--color-m-text-muted)]">{tr.marketingColImpressions}: </span>

                    {m.impressions.toLocaleString()}

                  </p>

                  <p>

                    <span className="text-[var(--color-m-text-muted)]">{tr.marketingColClicks}: </span>

                    {m.clicks.toLocaleString()}

                  </p>

                  <p>

                    <span className="text-[var(--color-m-text-muted)]">{tr.marketingColCtr}: </span>

                    {formatCtr(m.ctr)}

                  </p>

                </div>

              );

            },

          },

          {

            key: 'actions',

            header: tr.adminColActions,

            className: 'w-[1%] whitespace-nowrap',

            render: (row) => (

              <CampaignRowActions

                campaign={row}

                labels={{

                  view: tr.adminView,

                  edit: tr.edit,

                  metrics: tr.marketingMetrics,

                  pause: tr.marketingActionPause,

                  activate: tr.marketingActionActivate,

                  end: tr.marketingActionEnd,

                  delete: tr.delete,

                  moreActions: tr.adminMoreActions,

                }}

                statusPending={statusMutation.isPending}

                endPending={endMutation.isPending}

                onPause={(id) => statusMutation.mutate({ id, status: 'paused' })}

                onActivate={(id) => statusMutation.mutate({ id, status: 'active' })}

                onEnd={(id) => endMutation.mutate(id)}

                onDelete={setDeleteId}

              />

            ),

          },

        ]}

      />



      <AdminPagination

        pagination={query.data.pagination}

        onPageChange={(p) => updateParams({ page: String(p) })}

      />



      <ConfirmModal

        open={!!deleteId}

        title={tr.marketingDeleteTitle}

        body={tr.marketingDeleteBody}

        confirmLabel={tr.delete}

        destructive

        loading={deleteMutation.isPending}

        onClose={() => setDeleteId(null)}

        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}

      />

    </PageContainer>

  );

}

