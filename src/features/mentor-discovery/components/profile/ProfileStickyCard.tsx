import { format } from 'date-fns';
import { Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import { formatWalletMoney } from '@/features/mentor/lib/format-wallet';
import { lessonFormatLabel } from '@/features/mentor-discovery/lib/mentor-profile-format';
import { useFavouriteMentor } from '@/features/search/hooks/useFavouriteMentor';
import type { DiscoveryFullProfile } from '@/types/discovery';

export function ProfileStickyCard({
  profile,
  canRequest,
  isFavourited,
  onRequestLesson,
}: {
  profile: DiscoveryFullProfile;
  canRequest: boolean;
  isFavourited: boolean;
  onRequestLesson: () => void;
}) {
  const tr = useStrings();
  const earliest = profile.availability_summary.next_available_slots[0];
  const {
    isFavourited: saved,
    isUpdating,
    toggleFavourite,
  } = useFavouriteMentor(profile.mentor_id, isFavourited);

  return (
    <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5 shadow-[var(--shadow-m-card)]">
      <div>
        {profile.pricing_summary.hourly_rate != null ? (
          <p className="text-2xl font-bold text-[var(--color-m-text)]">
            {formatWalletMoney(profile.pricing_summary.hourly_rate)}
            <span className="text-sm font-normal text-[var(--color-m-text-muted)]">
              /{tr.hourlyRate.toLowerCase()}
            </span>
          </p>
        ) : (
          <p className="text-sm text-[var(--color-m-text-secondary)]">
            {tr.pricingSharedAfterReview}
          </p>
        )}
      </div>

      {profile.teaching_formats.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
            {tr.profileAvailabilityFormatsLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.teaching_formats.map((f) => (
              <Badge key={f} variant="primary">
                {lessonFormatLabel(f)}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {earliest ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
            {tr.profileAvailabilityEarliestLabel}
          </p>
          <p className="mt-1 text-sm text-[var(--color-m-text)]">
            {format(new Date(earliest.slot_start), 'PPp', { locale: getDateFnsLocale() })}
          </p>
        </div>
      ) : null}

      {canRequest ? (
        <div className="mt-4 flex flex-col gap-2">
          <Button type="button" fullWidth onClick={onRequestLesson}>
            {tr.requestLesson}
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            isLoading={isUpdating}
            onClick={() => void toggleFavourite().catch(() => undefined)}
          >
            <Bookmark className={saved ? 'size-4 fill-current' : 'size-4'} aria-hidden />
            {saved ? tr.unsaveMentor : tr.saveMentor}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
