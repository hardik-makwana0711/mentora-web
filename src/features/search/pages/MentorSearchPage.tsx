import { useMemo, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import i18n from '@/i18n';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { MentorSearchCard } from '@/features/search/components/MentorSearchCard';
import { DiscoveryStructuredFilters } from '@/features/search/components/DiscoveryStructuredFilters';
import { ActiveFilterChips } from '@/features/search/components/ActiveFilterChips';
import { useMentorSearch } from '@/features/search/hooks/useMentorSearch';
import { SponsoredCardPlacement } from '@/features/marketing/components/SponsoredCardPlacement';
import { useStrings } from '@/constants/strings';

/** Insert sponsored card after the 5th mentor card (PDF: after 5–8 cards). */
const SPONSORED_AFTER_MENTOR_COUNT = 5;

function MentorCardSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="flex gap-3">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <Skeleton className="mt-4 h-20 w-full rounded-xl" />
    </div>
  );
}

export default function MentorSearchPage() {
  const tr = useStrings();
  const {
    query,
    setQuery,
    filters,
    setFilters,
    filterLabels,
    setFilterLabels,
    clearAllFilters,
    items,
    total,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMentorSearch();

  const sponsoredSubject = filterLabels.subject_name ?? filters.subject;
  const sponsoredExamType = filterLabels.exam_subject_name;
  const showSponsoredSlot = items.length >= SPONSORED_AFTER_MENTOR_COUNT;

  const gridItems = useMemo(() => {
    const nodes: ReactNode[] = [];
    items.forEach((item, index) => {
      nodes.push(<MentorSearchCard key={item.mentor_id} item={item} layout="grid" />);
      if (index === SPONSORED_AFTER_MENTOR_COUNT - 1 && showSponsoredSlot) {
        nodes.push(
          <SponsoredCardPlacement
            key="sponsored-search"
            placement="search_results"
            subject={sponsoredSubject}
            examType={sponsoredExamType}
            className="col-span-full h-full"
          />
        );
      }
    });
    return nodes;
  }, [items, showSponsoredSlot, sponsoredSubject, sponsoredExamType]);

  return (
    <PageContainer>
      <PageHeader title={tr.findMentor} description={tr.searchPlaceholder} />

      <div className="app-search-input">
        <Search className="size-5 shrink-0 text-[var(--color-m-text-muted)]" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-base text-[var(--color-m-text)] outline-none placeholder:text-[var(--color-m-text-muted)]"
        />
        {query ? (
          <button
            type="button"
            aria-label={tr.clearSearch}
            onClick={() => setQuery('')}
            className="rounded-lg p-1 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72 xl:w-80">
          <DiscoveryStructuredFilters
            filters={filters}
            labels={filterLabels}
            onChange={setFilters}
            onLabelsChange={setFilterLabels}
          />
          <ActiveFilterChips
            filters={filters}
            labels={filterLabels}
            onChange={setFilters}
            onLabelsChange={setFilterLabels}
            onClearAll={clearAllFilters}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {!isPending && !isError && items.length > 0 ? (
            <p className="mb-4 text-sm text-[var(--color-m-text-muted)]">
              {total != null ? i18n.t('mentorsFound', { count: total }) : `${items.length}`}
            </p>
          ) : null}

          {isPending ? (
            <div className="mentor-results-grid">
              <MentorCardSkeleton />
              <MentorCardSkeleton />
              <MentorCardSkeleton />
              <MentorCardSkeleton />
            </div>
          ) : isError ? (
            <ErrorState title={tr.mentorsLoadError} onRetry={() => void refetch()} />
          ) : items.length === 0 ? (
            <EmptyState
              title={tr.noMentorsFound}
              description={tr.noMentorsHint}
              action={
                <Button type="button" variant="primary" size="sm" onClick={clearAllFilters}>
                  {tr.clearFilters}
                </Button>
              }
            />
          ) : (
            <>
              <div className="mentor-results-grid">
                {gridItems}
              </div>
              {hasNextPage ? (
                <div className="flex justify-center py-8">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={isFetchingNextPage}
                    onClick={() => void fetchNextPage()}
                  >
                    {tr.loadMore}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
