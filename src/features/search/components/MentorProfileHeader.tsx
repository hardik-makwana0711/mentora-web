import { BadgeCheck, MessageSquare, Star } from 'lucide-react';
import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { FavouriteButton } from '@/features/search/components/FavouriteButton';
import { isVerified } from '@/features/search/lib/format-labels';
import { getUniversityDisplayName } from '@/features/education/lib/format-proficiencies';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import type { MentorPublicProfile } from '@/types/search';

export function MentorProfileHeader({
  mentor,
  isFavourited = false,
}: {
  mentor: MentorPublicProfile;
  isFavourited?: boolean;
}) {
  const tr = useStrings();
  const hasRating = mentor.rating != null && Number.isFinite(mentor.rating);

  return (
    <div className="flex gap-4">
      <PresignedAvatar storedUrl={mentor.avatar_url} name={mentor.name} className="size-20 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--color-m-text)]">{mentor.name}</h1>
            {isVerified(mentor.verification_status) ? (
              <span className="mt-1 flex items-center gap-1 text-sm font-medium text-[var(--color-m-primary)]">
                <BadgeCheck className="size-4" aria-hidden />
                {tr.verifiedMentor}
              </span>
            ) : null}
            {getUniversityDisplayName(mentor.primary_university, mentor.university) ? (
              <p className="mt-2 text-sm text-[var(--color-m-text-secondary)]">
                {getUniversityDisplayName(mentor.primary_university, mentor.university)}
              </p>
            ) : null}
            {/* Rating & Review count badges — matches mobile stat badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400">
                <Star className="size-3.5 fill-yellow-400 text-yellow-400" aria-hidden />
                {hasRating ? (mentor.rating as number).toFixed(1) : tr.ratingNotAvailable}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--color-brand-primary)]">
                <MessageSquare className="size-3.5" aria-hidden />
                {mentor.review_count > 0
                  ? i18n.t('reviewCount', { count: mentor.review_count })
                  : tr.noReviewsYet}
              </span>
            </div>
          </div>
          <FavouriteButton mentorId={mentor.id} initialIsFavourited={isFavourited} />
        </div>
      </div>
    </div>
  );
}
