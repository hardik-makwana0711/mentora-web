import type { RefObject } from 'react';
import i18n from '@/i18n';
import { ExpandableText } from '@/components/ui/ExpandableText';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { DiscoveryFullProfile } from '@/types/discovery';

export function ProfileAboutSection({
  profile,
  sectionRef,
}: {
  profile: DiscoveryFullProfile;
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const bio = profile.long_bio?.trim() || profile.short_bio?.trim() || '';

  return (
    <ProfileSectionWrapper
      id="overview"
      heading={i18n.t('aboutMentorName', { name: profile.display_name })}
      sectionRef={sectionRef}
    >
      {profile.profile_slogan ? (
        <p className="mb-3 text-base font-medium italic text-[var(--color-m-primary)]">
          “{profile.profile_slogan}”
        </p>
      ) : null}
      {bio ? <ExpandableText text={bio} previewLines={5} /> : null}
    </ProfileSectionWrapper>
  );
}
