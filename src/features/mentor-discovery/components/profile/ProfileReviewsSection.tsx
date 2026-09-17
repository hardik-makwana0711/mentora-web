import { useState, type RefObject } from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import { reviewerTypeLabel } from '@/features/mentor-discovery/lib/mentor-profile-format';
import { getValidReviews } from '@/features/mentor-discovery/lib/mentor-profile-sections';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { DiscoveryFullProfile } from '@/types/discovery';

const INITIAL_COUNT = 3;

export function ProfileReviewsSection({
  profile,
  sectionRef,
  canReview,
  onLeaveReview,
}: {
  profile: DiscoveryFullProfile;
  sectionRef?: RefObject<HTMLElement | null>;
  canReview?: boolean;
  onLeaveReview?: () => void;
}) {
  const tr = useStrings();
  const [expanded, setExpanded] = useState(false);
  const reviews = getValidReviews(profile);
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_COUNT);

  const actions =
    canReview && onLeaveReview ? (
      <Button type="button" variant="secondary" size="sm" onClick={onLeaveReview}>
        {tr.leaveAReview}
      </Button>
    ) : null;

  return (
    <ProfileSectionWrapper
      id="reviews"
      heading={tr.reviews}
      sectionRef={sectionRef}
      actions={actions}
    >
      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.noReviewsYet}</p>
      ) : (
        <div className="space-y-4">
          {visible.map((review) => (
            <div
              key={review.id}
              className="border-b border-[var(--color-m-card-border)] pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        review.rating != null && i < Math.round(review.rating)
                          ? 'size-4 fill-yellow-400 text-yellow-400'
                          : 'size-4 text-[var(--color-m-card-border)]'
                      }
                      aria-hidden
                    />
                  ))}
                </div>
                {review.is_verified ? (
                  <Badge variant="success">{tr.profileReviewVerifiedBadge}</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--color-m-text)]">
                {reviewerTypeLabel(review.reviewer_type, review.reviewer_name_display)}
              </p>
              {review.review_text ? (
                <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">
                  {review.review_text}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">
                {format(new Date(review.created_at), 'PP', { locale: getDateFnsLocale() })}
              </p>
            </div>
          ))}

          {reviews.length > INITIAL_COUNT ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? tr.profileReviewsShowFewer : tr.profileReviewsViewAll}
            </Button>
          ) : null}
        </div>
      )}
    </ProfileSectionWrapper>
  );
}
