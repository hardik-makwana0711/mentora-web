import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  ActiveDiscoveryFilterChips,
  DiscoveryFilterPanel,
  DiscoveryFilterSidebar,
} from '@/features/mentor-discovery/components/DiscoveryFilterPanel';
import { DiscoveryMentorPanel } from '@/features/mentor-discovery/components/DiscoveryMentorPanel';
import { SponsoredCardPlacement } from '@/features/marketing/components/SponsoredCardPlacement';
import { useDiscoveryFeed } from '@/features/mentor-discovery/hooks/useDiscoveryFeed';
import { discoveryService } from '@/services/discovery.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useStrings } from '@/constants/strings';
import type { DiscoveryFilters } from '@/types/discovery';

export default function MentorDiscoveryPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [searchQ, setSearchQ] = useState('');
  const [likePrompt, setLikePrompt] = useState<string | null>(null);
  const [includeSeen, setIncludeSeen] = useState(false);

  const feedFilters = includeSeen ? { ...filters, include_seen: true } : filters;

  const {
    mentors,
    isLoading,
    isError,
    refetch,
    loadMore,
    resetFeed,
    updateSavedState,
    emptyReason,
    hasMore,
  } = useDiscoveryFeed(feedFilters);

  useEffect(() => {
    document.title = tr.discoveryPageTitle;
  }, [tr.discoveryPageTitle]);

  const applySearch = () => {
    const q = searchQ.trim();
    setFilters((f) => ({ ...f, subject: q || undefined }));
    resetFeed();
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQ('');
    setIncludeSeen(false);
    resetFeed();
  };

  const showAllMentorsAgain = () => {
    setIncludeSeen(true);
    resetFeed();
  };

  const handleLike = async (mentorId: string) => {
    try {
      await discoveryService.likeMentor(mentorId);
      setLikePrompt(mentorId);
    } catch {
      toast.error(tr.actionFailed);
    }
  };

  const handleSkip = async (mentorId: string) => {
    try {
      await discoveryService.dislikeMentor(mentorId);
    } catch {
      toast.error(tr.actionFailed);
    }
  };

  const handleSaveToggle = async (mentorId: string, saved: boolean) => {
    try {
      if (saved) await discoveryService.saveMentor(mentorId);
      else await discoveryService.unsaveMentor(mentorId);
      updateSavedState(mentorId, saved);
      toast.success(saved ? tr.mentorSaved : tr.mentorUnsaved);
    } catch {
      toast.error(tr.actionFailed);
    }
  };

  const handleViewProfile = (mentorId: string) => {
    navigate(`${roleBase}/mentors/${mentorId}`);
  };

  return (
    <PageContainer className="discovery-page">
      <PageHeader title={tr.discoveryPageTitle} description={tr.discoveryPageSubtitle} />

      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-4 lg:w-72 xl:w-80">
          <DiscoveryFilterSidebar
            filters={filters}
            onChange={setFilters}
            onApply={resetFeed}
            onClear={clearFilters}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="hidden w-full gap-2 lg:inline-flex"
            onClick={() => navigate(`${roleBase}/mentor-discovery/saved`)}
          >
            <Bookmark className="size-4" aria-hidden />
            {tr.savedMentors}
          </Button>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-stretch gap-2">
            <div className="app-search-input min-w-0 flex-1">
              <Search className="size-5 shrink-0 text-[var(--color-m-text-muted)]" aria-hidden />
              <input
                type="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                placeholder={tr.discoverySearchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-base text-[var(--color-m-text)] outline-none placeholder:text-[var(--color-m-text-muted)]"
              />
            </div>
            <DiscoveryFilterPanel
              filters={filters}
              onChange={setFilters}
              onApply={resetFeed}
              onClear={clearFilters}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 gap-2 lg:hidden"
              onClick={() => navigate(`${roleBase}/mentor-discovery/saved`)}
            >
              <Bookmark className="size-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">{tr.savedMentors}</span>
            </Button>
          </div>

          <ActiveDiscoveryFilterChips
            filters={filters}
            onRemove={(key) => {
              setFilters((f) => {
                const next = { ...f };
                if (key === 'tags') delete next.tags;
                else delete next[key];
                return next;
              });
              resetFeed();
            }}
            onClearAll={clearFilters}
          />

          {isError ? (
            <ErrorState title={tr.mentorsLoadError} onRetry={() => void refetch()} />
          ) : (
            <DiscoveryMentorPanel
              mentors={mentors}
              isLoading={isLoading}
              onLike={handleLike}
              onSkip={handleSkip}
              onSaveToggle={handleSaveToggle}
              onViewProfile={handleViewProfile}
              onLoadMore={() => void loadMore()}
              onResetFilters={clearFilters}
              onShowAgain={showAllMentorsAgain}
              onBrowseSearch={() => navigate(`${roleBase}/search`)}
              emptyReason={emptyReason}
              hasMore={hasMore}
            />
          )}

          {!isError ? (
            <SponsoredCardPlacement
              placement="discovery_feed"
              subject={filters.subject}
              examType={filters.exam_type}
            />
          ) : null}
        </div>
      </div>

      <Modal
        open={Boolean(likePrompt)}
        title={tr.likedMentorTitle}
        onClose={() => setLikePrompt(null)}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setLikePrompt(null)}>
              {tr.continueBrowsing}
            </Button>
            {likePrompt ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  navigate(`${roleBase}/mentors/${likePrompt}?request=trial`);
                  setLikePrompt(null);
                }}
              >
                {tr.requestTrialLesson}
              </Button>
            ) : null}
          </div>
        }
      >
        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.likedMentorHint}</p>
      </Modal>
    </PageContainer>
  );
}
