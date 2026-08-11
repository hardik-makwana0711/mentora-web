import { Link, useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { PageContainer } from '@/components/layouts/PageContainer';

import { PageHeader } from '@/components/ui/PageHeader';

import { Card } from '@/components/ui/Card';

import { BackLink } from '@/components/ui/BackLink';

import { Skeleton } from '@/components/ui/Skeleton';

import { ErrorState } from '@/components/ui/ErrorState';

import { CampaignStatusBadge } from '@/features/admin/components/CampaignStatusBadge';

import { SponsoredCardPreview } from '@/features/admin/components/SponsoredCardPreview';

import {

  formatCampaignDate,

  getLanguageLabel,

  PLACEMENT_LABEL_KEYS,

  ROLE_LABEL_KEYS,

} from '@/features/admin/lib/marketing-labels';

import { adminMarketingService } from '@/services/admin-marketing.service';

import { qk } from '@/constants/query-keys';

import { useStrings } from '@/constants/strings';

import { adminLinkButtonClass } from '@/features/admin/lib/admin-ui';

import { getDateFnsLocale } from '@/lib/date-locale';



function DetailSection({

  title,

  children,

}: {

  title: string;

  children: React.ReactNode;

}) {

  return (

    <section className="space-y-3">

      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">

        {title}

      </h2>

      {children}

    </section>

  );

}



function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-m-text-muted)]">{label}</p>
      <div className="mt-0.5 text-sm text-[var(--color-m-text)]">{value}</div>
    </div>
  );
}



export default function AdminMarketingCampaignDetailPage() {

  const { id = '' } = useParams();

  const tr = useStrings();

  const dateLocale = getDateFnsLocale();

  const deliveryLanguage = (language: string) => getLanguageLabel(tr, language);



  const query = useQuery({

    queryKey: qk.adminMarketingCampaign(id),

    queryFn: () => adminMarketingService.getCampaign(id),

    enabled: !!id,

  });



  if (query.isPending) {

    return (

      <PageContainer width="full">

        <Skeleton className="h-96 w-full rounded-2xl" />

      </PageContainer>

    );

  }



  if (query.isError || !query.data) {

    return (

      <PageContainer width="full">

        <ErrorState title={tr.marketingCampaignLoadError} onRetry={() => void query.refetch()} />

      </PageContainer>

    );

  }



  const c = query.data;

  const languageLabel = deliveryLanguage(c.language);



  return (

    <PageContainer width="full">

      <BackLink to="/admin/marketing">{tr.adminNavMarketing}</BackLink>

      <PageHeader

        title={c.internalName}

        description={tr.marketingCampaignDetail}

        actions={

          <div className="flex flex-wrap gap-2">

            <Link to={`/admin/marketing/${id}/edit`} className={adminLinkButtonClass}>

              {tr.edit}

            </Link>

            <Link to={`/admin/marketing/${id}/metrics`} className={adminLinkButtonClass}>

              {tr.marketingMetrics}

            </Link>

          </div>

        }

      />



      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

        <div className="space-y-4">

          <Card className="space-y-6 p-6">

            <DetailSection title={tr.marketingSectionSchedule}>

              <div className="flex flex-wrap items-center gap-2">

                <CampaignStatusBadge status={c.status} endDate={c.endDate} />

                <span className="text-sm text-[var(--color-m-text-muted)]">

                  {formatCampaignDate(c.startDate, dateLocale)} –{' '}

                  {formatCampaignDate(c.endDate, dateLocale)}

                </span>

              </div>

            </DetailSection>



            <DetailSection title={tr.marketingSectionCampaignContent}>

              <p className="rounded-lg border border-[var(--color-brand-primary)]/20 bg-[var(--color-brand-primary)]/5 px-3 py-2 text-xs leading-relaxed text-[var(--color-m-text-secondary)]">

                {tr.marketingContentLanguageNote}

              </p>

              <span className="inline-flex items-center rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-hover-overlay)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-m-text)]">

                {tr.marketingDeliveryLanguageBadge.replace('{{language}}', languageLabel)}

              </span>

              <div className="space-y-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-hover-overlay)] p-4">

                <div>

                  <p className="text-xs text-[var(--color-m-text-muted)]">{tr.marketingFieldTitle}</p>

                  <p className="mt-0.5 text-base font-semibold text-[var(--color-m-text)]">{c.title}</p>

                </div>

                {c.subtitle ? (

                  <div>

                    <p className="text-xs text-[var(--color-m-text-muted)]">{tr.marketingFieldSubtitle}</p>

                    <p className="mt-0.5 text-sm text-[var(--color-m-text-secondary)]">{c.subtitle}</p>

                  </div>

                ) : null}

                {c.description ? (

                  <div>

                    <p className="text-xs text-[var(--color-m-text-muted)]">{tr.marketingFieldDescription}</p>

                    <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-m-text-secondary)]">

                      {c.description}

                    </p>

                  </div>

                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">

                  {c.sponsorLabel ? (

                    <DetailField label={tr.marketingFieldSponsorLabel} value={c.sponsorLabel} />

                  ) : null}

                  {c.badgeText ? (

                    <DetailField label={tr.marketingFieldBadgeText} value={c.badgeText} />

                  ) : null}

                  {c.ctaText ? (

                    <DetailField label={tr.marketingFieldCtaText} value={c.ctaText} />

                  ) : null}

                  <DetailField

                    label={tr.marketingFieldCtaUrl}

                    value={

                      <a

                        href={c.ctaUrl}

                        className="break-all text-[var(--color-brand-primary)] hover:underline"

                        target="_blank"

                        rel="noreferrer"

                      >

                        {c.ctaUrl}

                      </a>

                    }

                  />

                </div>

              </div>

            </DetailSection>



            <DetailSection title={tr.marketingSectionDeliverySettings}>

              <dl className="grid gap-4 sm:grid-cols-2">

                <DetailField label={tr.marketingColSponsor} value={c.sponsorLabel ?? '—'} />

                <DetailField label={tr.marketingFieldLanguage} value={languageLabel} />

                <DetailField

                  label={tr.marketingColPlacements}

                  value={c.placements

                    .map((p) => tr[PLACEMENT_LABEL_KEYS[p] as keyof typeof tr] as string)

                    .join(', ')}

                />

                <DetailField

                  label={tr.marketingColRoles}

                  value={c.roles.map((r) => tr[ROLE_LABEL_KEYS[r] as keyof typeof tr] as string).join(', ')}

                />

                <DetailField label={tr.marketingFieldPriority} value={c.priority} />

              </dl>

            </DetailSection>

          </Card>

        </div>



        <aside className="xl:sticky xl:top-4 xl:self-start">

          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">

            {tr.marketingPreviewTitle}

          </h2>

          <SponsoredCardPreview card={c} />

        </aside>

      </div>

    </PageContainer>

  );

}

