import { Calendar, Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  formatGradeLevels,
  formatLessonFormat,
  formatListingStatus,
  formatSubject,
} from '@/features/listings/lib/listing-labels';
import { formatListingStructuredTitle } from '@/features/education/lib/format-proficiencies';
import { StatusToggle } from '@/features/listings/components/StatusToggle';
import { MentorModerationBadge } from '@/features/profile/components/MentorModerationNotice';
import { useStrings } from '@/constants/strings';
import type { ListingStructuredInfo } from '@/types/education';
import type { MentorListing } from '@/types/listings';
import { cn } from '@/lib/utils';

function mentorListingStructured(listing: MentorListing): ListingStructuredInfo | null {
  const grades = listing.structured_grade_levels ?? [];
  if (!listing.subject_id && !listing.exam_track_subject_id && grades.length === 0) {
    return null;
  }
  return {
    subject_id: listing.subject_id ?? null,
    subject_display_name: listing.structured_subject?.display_name ?? null,
    exam_track_subject_id: listing.exam_track_subject_id ?? null,
    exam_display_name: listing.structured_exam?.display_name ?? null,
    grade_levels: grades.map((g) => ({
      grade_level_id: g.grade_level_id,
      grade_number: g.grade_number,
      display_name: g.display_name,
    })),
  };
}

export function ListingCard({
  listing,
  onToggleStatus,
  toggleLoading,
  listingsBase,
}: {
  listing: MentorListing;
  onToggleStatus: (listing: MentorListing) => void;
  toggleLoading?: boolean;
  listingsBase: string;
}) {
  const tr = useStrings();
  const navigate = useNavigate();
  const isInactive = listing.status === 'inactive';
  const structured = mentorListingStructured(listing);
  const displaySubject = formatListingStructuredTitle(structured) ?? formatSubject(listing.subject);
  const gradeDisplay =
    structured?.grade_levels?.length && !structured.exam_display_name
      ? structured.grade_levels.map((g) => g.display_name).join(', ')
      : formatGradeLevels(listing.grade_levels);

  return (
    <Card className={cn('overflow-hidden p-0 transition', isInactive && 'opacity-90')}>
      <div className="border-b border-[var(--color-m-card-border)] p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{displaySubject}</h2>
          <Badge variant={listing.lesson_format === 'one_to_one' ? 'primary' : 'info'}>
            {formatLessonFormat(listing.lesson_format)}
          </Badge>
          {structured?.exam_display_name ? (
            <Badge variant="info">{structured.exam_display_name}</Badge>
          ) : null}
          <Badge variant={isInactive ? 'danger' : 'success'}>{formatListingStatus(listing.status)}</Badge>
          {listing.listing_moderation_status ? (
            <MentorModerationBadge status={listing.listing_moderation_status} />
          ) : null}
        </div>
        {listing.rejection_reason ? (
          <p className="mt-2 text-sm text-[var(--color-m-error)]">{listing.rejection_reason}</p>
        ) : null}
        {!structured?.exam_display_name ? (
          <p className="mt-3 text-sm text-[var(--color-m-text-secondary)]">
            <span className="font-medium text-[var(--color-m-text-muted)]">{tr.gradesLabel}: </span>
            {gradeDisplay}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-6 border-b border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)]/40 px-4 py-3 md:px-5">
        <div className="flex items-center gap-1.5 text-sm">
          <Eye className="size-4 text-[var(--color-m-text-muted)]" aria-hidden />
          <span className="text-[var(--color-m-text-muted)]">{tr.listingViews}:</span>
          <span className="font-semibold text-[var(--color-m-text)]">{listing.views_count}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar className="size-4 text-[var(--color-m-text-muted)]" aria-hidden />
          <span className="text-[var(--color-m-text-muted)]">{tr.listingBookings}:</span>
          <span className="font-semibold text-[var(--color-m-text)]">{listing.bookings_count}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate(`${listingsBase}/${listing.id}/edit`)}
          >
            <Pencil className="size-4" aria-hidden />
            {tr.editListing}
          </Button>
          <StatusToggle
            status={listing.status}
            onToggle={() => onToggleStatus(listing)}
            loading={toggleLoading}
            disabled={listing.listing_moderation_status === 'hidden_by_admin'}
          />
        </div>
      </div>
    </Card>
  );
}
