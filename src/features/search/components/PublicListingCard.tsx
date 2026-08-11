import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  formatGradeLevels,
  formatLessonFormat,
  formatSubject,
} from '@/features/search/lib/format-labels';
import { formatListingStructuredTitle } from '@/features/education/lib/format-proficiencies';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { useStrings } from '@/constants/strings';
import type { ListingStructuredInfo } from '@/types/education';
import type { PublicListingSummary } from '@/types/search';

export type PublicListingLocationState = {
  mentorId?: string;
  mentorName?: string;
  structured?: ListingStructuredInfo | null;
};

export function PublicListingCard({
  listing,
  mentorId,
  mentorName,
  canBook,
}: {
  listing: PublicListingSummary;
  mentorId: string;
  mentorName: string;
  canBook: boolean;
}) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.role);
  const isParent = role === 'parent';

  function openListing() {
    navigate(`${roleBase}/search/listings/${listing.id}`, {
      state: { mentorId, mentorName, structured: listing.structured ?? null } satisfies PublicListingLocationState,
    });
  }

  const structuredTitle = formatListingStructuredTitle(listing.structured);
  const displaySubject = structuredTitle ?? formatSubject(listing.subject);
  const gradeBadge =
    listing.structured?.grade_levels?.length && !listing.structured.exam_display_name
      ? listing.structured.grade_levels.map((g) => g.display_name).join(', ')
      : formatGradeLevels(listing.grade_levels);

  return (
    <Card className="mb-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-m-text)]">{displaySubject}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{formatLessonFormat(listing.lesson_format)}</Badge>
            {!listing.structured?.exam_display_name ? <Badge>{gradeBadge}</Badge> : null}
            {listing.structured?.exam_display_name ? (
              <Badge>{listing.structured.exam_display_name}</Badge>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-[var(--color-m-text-muted)]">
          {listing.views_count} {tr.views} · {listing.bookings_count} {tr.bookings}
        </p>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-[var(--color-m-text-secondary)]">{listing.description}</p>
      <Button type="button" className="mt-4 w-full sm:w-auto" size="sm" onClick={openListing}>
        {canBook && isParent ? tr.bookLesson : tr.viewListingDetails}
      </Button>
    </Card>
  );
}
