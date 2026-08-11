import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { FavouriteButton } from '@/features/search/components/FavouriteButton';
import { FavouriteListingButton } from '@/features/search/components/FavouriteListingButton';
import {
  formatGradeLevels,
  formatLessonFormat,
  formatSubject,
  isVerified,
} from '@/features/search/lib/format-labels';
import {
  formatListingStructuredTitle,
  getUniversityDisplayName,
} from '@/features/education/lib/format-proficiencies';
import type { PublicListingLocationState } from '@/features/search/components/PublicListingCard';
import { useListingStructuredFallback } from '@/features/search/hooks/useListingStructuredFallback';
import { searchService } from '@/services/search.service';
import { isHttpNotFound } from '@/lib/http-errors';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';

type LocationState = PublicListingLocationState;

export default function PublicListingDetailPage() {
  const tr = useStrings();
  const { listingId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.role);
  const state = (location.state as LocationState | null) ?? {};

  const listingQuery = useQuery({
    queryKey: qk.publicListing(listingId),
    queryFn: () => searchService.getPublicListing(listingId),
    enabled: Boolean(listingId),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!listingId || !listingQuery.data) return;
    void searchService.trackListingView(listingId).catch(() => undefined);
  }, [listingId, listingQuery.data]);

  const mentorId = state.mentorId ?? listingQuery.data?.mentor.id ?? '';
  const { structured, isResolvingStructured, profileMentor } = useListingStructuredFallback(
    listingId,
    mentorId,
    state.structured
  );

  if (listingQuery.isPending || isResolvingStructured) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (listingQuery.isError || !listingQuery.data) {
    if (isHttpNotFound(listingQuery.error)) {
      return <EmptyState title={tr.listingUnavailable} />;
    }
    return (
      <ErrorState title={tr.listingLoadError} onRetry={() => void listingQuery.refetch()} />
    );
  }

  const { listing, mentor } = listingQuery.data;
  const structuredTitle = formatListingStructuredTitle(structured);
  const displaySubject = structuredTitle ?? formatSubject(listing.subject);
  const gradeBadge =
    structured?.grade_levels?.length && !structured.exam_display_name
      ? structured.grade_levels.map((g) => g.display_name).join(', ')
      : formatGradeLevels(listing.grade_levels);
  const universityDisplay = getUniversityDisplayName(
    profileMentor?.primary_university,
    mentor.university
  );
  const isParent = role === 'parent';
  const canBook = listingQuery.data.viewer_permissions.can_book && isParent;

  function startBooking() {
    if (!canBook) return;
    const params = new URLSearchParams({
      listingId: listing.id,
      mentorId,
      mentorName: mentor.name,
      subject: structured?.subject_display_name ?? listing.subject,
    });
    if (listing.price != null) params.set('price', String(listing.price));
    navigate(`${roleBase}/search/booking?${params.toString()}`);
  }

  return (
    <PageContainer>
      <BackLink to={`${roleBase}/search/mentors/${mentorId}`}>{tr.back}</BackLink>

      <PageHeader title={tr.listingDetail} />

      <Card className="mt-4 flex gap-3 p-4">
        <PresignedAvatar storedUrl={mentor.avatar_url} name={mentor.name} className="size-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1 font-semibold text-[var(--color-m-text)]">
                {mentor.name}
                {isVerified(mentor.verification_status) ? (
                  <BadgeCheck className="size-4 text-[var(--color-m-primary)]" aria-hidden />
                ) : null}
              </p>
              {universityDisplay ? (
                <p className="text-sm text-[var(--color-m-text-muted)]">{universityDisplay}</p>
              ) : null}
            </div>
            <FavouriteButton
              mentorId={mentorId}
              initialIsFavourited={mentor.is_favourited ?? false}
            />
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h2 className="text-xl font-bold text-[var(--color-m-text)]">{displaySubject}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{formatLessonFormat(listing.lesson_format)}</Badge>
          {!structured?.exam_display_name ? <Badge>{gradeBadge}</Badge> : null}
          {structured?.exam_display_name ? <Badge>{structured.exam_display_name}</Badge> : null}
          <FavouriteListingButton listingId={listing.id} initialIsFavourited={listing.is_favourited} />
        </div>
        {listing.price != null ? (
          <p className="mt-3 text-lg font-bold text-[var(--color-m-text)]">
            ${listing.price}
            <span className="text-sm font-medium text-[var(--color-m-text-muted)]">/saat</span>
          </p>
        ) : null}
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
          {listing.description}
        </p>
        <p className="mt-4 text-xs text-[var(--color-m-text-muted)]">
          {listing.views_count} {tr.views} · {listing.bookings_count} {tr.bookings}
        </p>
      </Card>

      <div className="mt-6">
        {canBook ? (
          <Button type="button" fullWidth onClick={startBooking}>
            {tr.continueToBooking}
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <FavouriteButton
              mentorId={mentorId}
              initialIsFavourited={mentor.is_favourited ?? false}
              size={28}
            />
            <p className="text-center text-sm text-[var(--color-m-text-muted)]">{tr.studentBookingNote}</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
