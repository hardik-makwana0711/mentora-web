import type { RefObject } from 'react';
import { Badge } from '@/components/ui/Badge';
import { useStrings } from '@/constants/strings';
import {
  examTypeLabel,
  gradeLevelLabel,
  lessonFormatLabel,
} from '@/features/mentor-discovery/lib/mentor-profile-format';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { DiscoveryFullProfile } from '@/types/discovery';

function ChipGroup({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <Badge key={v} variant="primary">
            {v}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function ProfileSubjectsSection({
  profile,
  sectionRef,
}: {
  profile: DiscoveryFullProfile;
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const tr = useStrings();
  const formats = profile.teaching_formats.map(lessonFormatLabel);
  const levels = profile.grade_levels.map(gradeLevelLabel);
  const examTypes = profile.exam_types.map(examTypeLabel);

  return (
    <ProfileSectionWrapper
      id="subjects"
      heading={tr.profileSubjectsHeading}
      sectionRef={sectionRef}
    >
      <div className="space-y-4">
        <ChipGroup label={tr.subjects} values={profile.subjects} />
        <ChipGroup label={tr.profileLevelsLabel} values={levels} />
        <ChipGroup label={tr.profileExamTypesLabel} values={examTypes} />
        <ChipGroup label={tr.teachingFormat} values={formats} />
      </div>
    </ProfileSectionWrapper>
  );
}
