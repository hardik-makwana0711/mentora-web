import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { BackLink } from '@/components/ui/BackLink';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { DataTable } from '@/components/ui/DataTable';
import {
  formatCampaignDate,
  formatCtr,
  PLACEMENT_LABEL_KEYS,
  PLATFORM_LABEL_KEYS,
} from '@/features/admin/lib/marketing-labels';
import { adminMarketingService } from '@/services/admin-marketing.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { adminLinkButtonClass } from '@/features/admin/lib/admin-ui';
import { getDateFnsLocale } from '@/lib/date-locale';

export default function AdminMarketingCampaignMetricsPage() {
  const { id = '' } = useParams();
  const tr = useStrings();
  const dateLocale = getDateFnsLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateFilters = useMemo(
    () => ({
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
    }),
    [searchParams]
  );

  const query = useQuery({
    queryKey: qk.adminMarketingCampaignMetrics(id, dateFilters),
    queryFn: () => adminMarketingService.getCampaignMetrics(id, dateFilters),
    enabled: !!id,
  });

  function updateDate(key: 'startDate' | 'endDate', value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  if (query.isPending) {
    return (
      <PageContainer width="full">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageContainer width="full">
        <ErrorState title={tr.marketingMetricsLoadError} onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  const data = query.data;

  return (
    <PageContainer width="full">
      <BackLink to={`/admin/marketing/${id}`}>{tr.marketingCampaignDetail}</BackLink>
      <PageHeader title={tr.marketingMetrics} description={data.internalName} />

      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          type="date"
          label={tr.marketingMetricsStartDate}
          value={dateFilters.startDate ?? ''}
          onChange={(e) => updateDate('startDate', e.target.value)}
          className="max-w-xs"
        />
        <Input
          type="date"
          label={tr.marketingMetricsEndDate}
          value={dateFilters.endDate ?? ''}
          onChange={(e) => updateDate('endDate', e.target.value)}
          className="max-w-xs"
        />
        <Link to={`/admin/marketing/${id}/edit`} className={`${adminLinkButtonClass} self-end`}>
          {tr.edit}
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase text-[var(--color-m-text-muted)]">{tr.marketingColImpressions}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-m-text)]">
            {data.totals.impressions.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-[var(--color-m-text-muted)]">{tr.marketingColClicks}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-m-text)]">{data.totals.clicks.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-[var(--color-m-text-muted)]">{tr.marketingColCtr}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-m-text)]">{formatCtr(data.totals.ctr)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">{tr.marketingMetricsByPlacement}</h2>
          <DataTable
            rows={data.byPlacement}
            empty={<p className="text-sm text-[var(--color-m-text-muted)]">{tr.marketingNoMetrics}</p>}
            columns={[
              {
                key: 'placement',
                header: tr.marketingColPlacements,
                render: (row) => tr[PLACEMENT_LABEL_KEYS[row.placement] as keyof typeof tr] as string,
              },
              {
                key: 'impressions',
                header: tr.marketingColImpressions,
                render: (row) => row.impressions.toLocaleString(),
              },
              {
                key: 'clicks',
                header: tr.marketingColClicks,
                render: (row) => row.clicks.toLocaleString(),
              },
              {
                key: 'ctr',
                header: tr.marketingColCtr,
                render: (row) => formatCtr(row.ctr),
              },
            ]}
          />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">{tr.marketingMetricsByPlatform}</h2>
          <DataTable
            rows={data.byPlatform}
            empty={<p className="text-sm text-[var(--color-m-text-muted)]">{tr.marketingNoMetrics}</p>}
            columns={[
              {
                key: 'platform',
                header: tr.marketingFieldPlatform,
                render: (row) =>
                  tr[PLATFORM_LABEL_KEYS[row.platform] as keyof typeof tr] as string ?? row.platform,
              },
              {
                key: 'impressions',
                header: tr.marketingColImpressions,
                render: (row) => row.impressions.toLocaleString(),
              },
              {
                key: 'clicks',
                header: tr.marketingColClicks,
                render: (row) => row.clicks.toLocaleString(),
              },
              {
                key: 'ctr',
                header: tr.marketingColCtr,
                render: (row) => formatCtr(row.ctr),
              },
            ]}
          />
        </div>
      </div>

      {data.dateRange.startDate || data.dateRange.endDate ? (
        <p className="mt-4 text-xs text-[var(--color-m-text-muted)]">
          {tr.marketingMetricsDateRange}:{' '}
          {data.dateRange.startDate ? formatCampaignDate(data.dateRange.startDate, dateLocale) : '—'} –{' '}
          {data.dateRange.endDate ? formatCampaignDate(data.dateRange.endDate, dateLocale) : '—'}
        </p>
      ) : null}
    </PageContainer>
  );
}
