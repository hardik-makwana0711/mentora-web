import type { RefObject } from 'react';
import { useStrings, type Strings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import { scrollToSection } from '@/features/mentor-discovery/hooks/useScrollSpy';
import type { ProfileSectionId } from '@/features/mentor-discovery/lib/mentor-profile-sections';

export function ProfileAnchorNav({
  sections,
  sectionRefs,
  activeId,
}: {
  sections: { id: ProfileSectionId; labelKey: keyof Strings }[];
  sectionRefs: Record<ProfileSectionId, RefObject<HTMLElement | null>>;
  activeId: string | null;
}) {
  const tr = useStrings();
  if (sections.length === 0) return null;

  return (
    <nav
      aria-label={tr.profileSectionNavAriaLabel}
      className="sticky top-20 z-20 -mx-1 flex gap-1 overflow-x-auto bg-[var(--color-m-bg)]/95 px-1 py-2 backdrop-blur"
    >
      {sections.map(({ id, labelKey }) => {
        const active = activeId === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={active ? 'true' : undefined}
            onClick={() => scrollToSection(sectionRefs[id])}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-[var(--color-m-primary)] text-white'
                : 'text-[var(--color-m-text-secondary)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]'
            )}
          >
            {tr[labelKey]}
          </button>
        );
      })}
    </nav>
  );
}
