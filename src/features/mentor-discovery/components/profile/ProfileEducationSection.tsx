import type { RefObject } from 'react';
import { BadgeCheck } from 'lucide-react';
import i18n from '@/i18n';
import { useStrings } from '@/constants/strings';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { DiscoveryFullProfile } from '@/types/discovery';

export function ProfileEducationSection({
  profile,
  sectionRef,
}: {
  profile: DiscoveryFullProfile;
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const tr = useStrings();
  const edu = profile.education;
  const universityName = edu.primary_university?.name || edu.university;
  const degreeLine = [edu.degree, edu.department].filter(Boolean).join(' · ');
  const isEducationVerified = profile.verification_badges.includes('Education Verified');

  return (
    <ProfileSectionWrapper id="education" heading={tr.education} sectionRef={sectionRef}>
      <div className="space-y-4">
        {universityName ? (
          <div>
            <p className="text-[15px] font-medium text-[var(--color-m-text)]">{universityName}</p>
            {degreeLine ? (
              <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">{degreeLine}</p>
            ) : null}
            {edu.graduation_year ? (
              <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
                {i18n.t('graduationYear')}: {edu.graduation_year}
              </p>
            ) : null}
            {isEducationVerified ? (
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-m-success)]">
                <BadgeCheck className="size-4" aria-hidden />
                {tr.profileEducationSectionVerified}
              </span>
            ) : null}
          </div>
        ) : null}

        {edu.high_school ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
              {tr.highSchool}
            </p>
            <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{edu.high_school}</p>
          </div>
        ) : null}

        {edu.certifications && edu.certifications.length > 0 ? (
          <ul className="list-inside list-disc text-sm text-[var(--color-m-text-secondary)]">
            {edu.certifications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </ProfileSectionWrapper>
  );
}
