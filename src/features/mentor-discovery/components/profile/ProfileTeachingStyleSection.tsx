import type { RefObject } from 'react';
import { Badge } from '@/components/ui/Badge';
import { useStrings } from '@/constants/strings';
import { teachingStyleLabel } from '@/features/mentor-discovery/lib/mentor-profile-format';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { DiscoveryFullProfile } from '@/types/discovery';

export function ProfileTeachingStyleSection({
  profile,
  sectionRef,
}: {
  profile: DiscoveryFullProfile;
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const tr = useStrings();
  return (
    <ProfileSectionWrapper id="teachingStyle" heading={tr.teachingStyle} sectionRef={sectionRef}>
      <div className="flex flex-wrap gap-2">
        {profile.teaching_style_tags.map((tag) => (
          <Badge key={tag} variant="info">
            {teachingStyleLabel(tag)}
          </Badge>
        ))}
      </div>
    </ProfileSectionWrapper>
  );
}
