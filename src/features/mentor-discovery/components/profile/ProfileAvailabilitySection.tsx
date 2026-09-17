import type { RefObject } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import { lessonFormatLabel } from '@/features/mentor-discovery/lib/mentor-profile-format';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { DiscoveryFullProfile } from '@/types/discovery';

export function ProfileAvailabilitySection({
  profile,
  sectionRef,
  onRequestLesson,
}: {
  profile: DiscoveryFullProfile;
  sectionRef?: RefObject<HTMLElement | null>;
  onRequestLesson: () => void;
}) {
  const tr = useStrings();
  const earliest = profile.availability_summary.next_available_slots[0];

  return (
    <ProfileSectionWrapper id="availability" heading={tr.availability} sectionRef={sectionRef}>
      <div className="space-y-4">
        {profile.teaching_formats.length > 0 ? (
          <div>
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

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
            {tr.profileAvailabilityEarliestLabel}
          </p>
          {earliest ? (
            <p className="mt-1 text-sm text-[var(--color-m-text)]">
              {format(new Date(earliest.slot_start), 'PPp', { locale: getDateFnsLocale() })}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
              {tr.profileAvailabilityNoSlots}
            </p>
          )}
        </div>

        <Button type="button" variant="secondary" size="sm" onClick={onRequestLesson}>
          {tr.requestLesson}
        </Button>
      </div>
    </ProfileSectionWrapper>
  );
}
