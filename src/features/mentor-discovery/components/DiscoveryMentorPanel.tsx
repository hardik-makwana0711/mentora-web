import { useEffect, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PhotoCarousel } from '@/features/mentor-discovery/components/PhotoCarousel';
import { useStrings } from '@/constants/strings';
import type { DiscoveryMentorCard } from '@/types/discovery';
import { cn } from '@/lib/utils';

function DiscoveryCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0 ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="flex flex-col lg:flex-row">
        <Skeleton className="aspect-[16/10] w-full lg:aspect-auto lg:min-h-[400px] lg:w-[38%]" />
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="mt-auto h-12 w-full" />
        </div>
      </div>
    </Card>
  );
}

function MentorDetailContent({
  mentor,
  onSaveToggle,
}: {
  mentor: DiscoveryMentorCard;
  onSaveToggle: (id: string, saved: boolean) => void;
}) {
  const tr = useStrings();
  const tagItems = [...mentor.subjects, ...mentor.exam_types, ...mentor.grade_levels];
  const slogan = mentor.profile_slogan || mentor.short_bio;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-m-text)]">{mentor.display_name}</h2>
          {mentor.title ? (
            <p className="mt-1 text-base text-[var(--color-m-text-secondary)]">{mentor.title}</p>
          ) : null}
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[var(--color-m-text)]">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
            {mentor.rating_average != null ? mentor.rating_average.toFixed(1) : '—'}
            <span className="font-normal text-[var(--color-m-text-muted)]">
              · {mentor.review_count} {tr.reviews}
            </span>
          </p>
        </div>
        <button
          type="button"
          className={cn(
            'shrink-0 rounded-xl p-2.5 transition',
            mentor.is_saved
              ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/30'
              : 'bg-[var(--color-m-hover-overlay)] text-[var(--color-m-text-muted)] hover:text-amber-400'
          )}
          onClick={() => onSaveToggle(mentor.mentor_id, !mentor.is_saved)}
          aria-label={`${mentor.is_saved ? tr.unsaveMentor : tr.saveMentor} ${mentor.display_name}`}
        >
          <Bookmark className={cn('size-5', mentor.is_saved && 'fill-current')} />
        </button>
      </div>

      {slogan ? (
        <blockquote className="mt-4 border-l-2 border-[var(--color-m-primary)]/50 pl-4 text-base italic leading-relaxed text-[var(--color-m-text-secondary)]">
          {slogan}
        </blockquote>
      ) : null}

      {tagItems.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.subjects}
          </p>
          <div className="flex flex-wrap gap-2">
            {tagItems.map((tag) => (
              <span key={tag} className="discovery-tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {mentor.teaching_style_tags.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.teachingStyle}
          </p>
          <div className="flex flex-wrap gap-2">
            {mentor.teaching_style_tags.map((tag) => (
              <span key={tag} className="discovery-tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {mentor.verification_badges.length > 0 ? (
        <p className="mt-4 text-sm text-[var(--color-m-text-secondary)]">
          <span className="font-semibold text-[var(--color-m-text-muted)]">{tr.verified}: </span>
          {mentor.verification_badges.join(' · ')}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {mentor.highlighted_review ? (
          <div className="rounded-xl bg-[var(--color-m-surface-light)] p-4 ring-1 ring-[var(--color-m-ring-subtle)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
              {tr.parentReview}
            </p>
            <p className="mt-2 line-clamp-4 text-sm italic text-[var(--color-m-text-secondary)]">
              &ldquo;{mentor.highlighted_review.review_text}&rdquo;
            </p>
          </div>
        ) : null}
        {mentor.highlighted_success_story ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/80">
              {tr.successStory}
            </p>
            <p className="mt-2 text-sm font-medium text-emerald-300">
              {mentor.highlighted_success_story.title}
              {mentor.highlighted_success_story.year
                ? ` · ${mentor.highlighted_success_story.year}`
                : ''}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DiscoveryMentorPanel({
  mentors,
  isLoading,
  onLike,
  onSkip,
  onSaveToggle,
  onViewProfile,
  onLoadMore,
  onResetFilters,
  onShowAgain,
  onBrowseSearch,
  emptyReason,
  hasMore,
}: {
  mentors: DiscoveryMentorCard[];
  isLoading: boolean;
  onLike: (mentorId: string) => void | Promise<void>;
  onSkip: (mentorId: string) => void | Promise<void>;
  onSaveToggle: (mentorId: string, saved: boolean) => void | Promise<void>;
  onViewProfile: (mentorId: string) => void;
  onLoadMore?: () => void;
  onResetFilters?: () => void;
  onShowAgain?: () => void;
  onBrowseSearch?: () => void;
  emptyReason?: 'all_seen' | 'no_results' | null;
  hasMore?: boolean;
}) {
  const tr = useStrings();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (mentors.length === 0) setIndex(0);
    else if (index >= mentors.length) setIndex(0);
  }, [mentors, index]);

  useEffect(() => {
    if (index >= mentors.length - 3 && index < mentors.length && onLoadMore) {
      onLoadMore();
    }
  }, [index, mentors.length, onLoadMore]);

  const current = mentors[index];
  const hasCards = index < mentors.length;

  if (isLoading && mentors.length === 0) {
    return <DiscoveryCardSkeleton />;
  }

  if (!hasCards) {
    if (mentors.length > 0) {
      return (
        <EmptyState
          title={tr.discoveryEndOfFeed}
          description={tr.discoveryEndOfFeedHint}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {hasMore && onLoadMore ? (
                <Button type="button" variant="primary" size="sm" onClick={onLoadMore}>
                  {tr.loadMore}
                </Button>
              ) : null}
              <Button type="button" variant="secondary" size="sm" onClick={() => setIndex(0)}>
                {tr.discoveryStartOver}
              </Button>
            </div>
          }
        />
      );
    }

    return (
      <EmptyState
        title={emptyReason === 'all_seen' ? tr.discoveryAllSeenTitle : tr.noMentorsFoundFilters}
        description={emptyReason === 'all_seen' ? tr.discoveryAllSeenHint : tr.tryChangingFilters}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {onShowAgain ? (
              <Button type="button" variant="primary" size="sm" onClick={onShowAgain}>
                {tr.discoveryShowAgain}
              </Button>
            ) : null}
            {onResetFilters ? (
              <Button type="button" variant="secondary" size="sm" onClick={onResetFilters}>
                {tr.clearFilters}
              </Button>
            ) : null}
            {onBrowseSearch ? (
              <Button type="button" variant="ghost" size="sm" onClick={onBrowseSearch}>
                {tr.discoveryBrowseSearch}
              </Button>
            ) : null}
          </div>
        }
      />
    );
  }

  if (!current) return null;

  const photos = [
    ...(current.primary_photo_url ? [current.primary_photo_url] : []),
    ...(current.additional_photos ?? []),
  ];

  const advance = (direction: 'skip' | 'like') => {
    if (direction === 'like') void onLike(current.mentor_id);
    else void onSkip(current.mentor_id);
    setIndex((i) => i + 1);
  };

  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="flex flex-col lg:min-h-[420px] lg:flex-row">
        <div className="relative shrink-0 lg:w-[38%] xl:w-[36%]">
          <PhotoCarousel
            photos={photos}
            alt={current.display_name}
            variant="panel"
            className="lg:absolute lg:inset-0 lg:min-h-full"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-8">
            <MentorDetailContent mentor={current} onSaveToggle={onSaveToggle} />
          </div>

          <div className="border-t border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)]/40 px-5 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-[var(--color-m-text-muted)]">
                {tr.discoveryCardProgress
                  .replace('{{current}}', String(index + 1))
                  .replace('{{total}}', String(mentors.length))}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  {tr.discoveryPrevious}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index >= mentors.length - 1}
                  onClick={() => setIndex((i) => Math.min(mentors.length - 1, i + 1))}
                >
                  {tr.discoveryNext}
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => advance('skip')}>
                <X className="size-4" aria-hidden />
                {tr.skipMentor}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void onSaveToggle(current.mentor_id, !current.is_saved)}
              >
                <Bookmark className={cn('size-4', current.is_saved && 'fill-current')} aria-hidden />
                {tr.discoverySaveForLater}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onViewProfile(current.mentor_id)}>
                <User className="size-4" aria-hidden />
                {tr.discoveryViewProfile}
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => advance('like')}>
                <Heart className="size-4" aria-hidden />
                {tr.likeMentor}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** @deprecated Use DiscoveryMentorPanel — kept for existing imports */
export const SwipeMentorCard = DiscoveryMentorPanel;
