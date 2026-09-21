import { useState, type RefObject } from 'react';
import i18n from '@/i18n';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import { successStoryCategoryLabel } from '@/features/mentor-discovery/lib/mentor-profile-format';
import { getValidSuccessStories } from '@/features/mentor-discovery/lib/mentor-profile-sections';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { DiscoveryFullProfile, DiscoveryProfileSuccessStory } from '@/types/discovery';

const INITIAL_COUNT = 3;

function StoryCard({ story }: { story: DiscoveryProfileSuccessStory }) {
  const category = successStoryCategoryLabel(story.exam_type);
  const meta = [category, story.year ? String(story.year) : null].filter(Boolean).join(' · ');

  return (
    <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-4">
      {story.title ? (
        <p className="text-[15px] font-semibold text-[var(--color-m-text)]">{story.title}</p>
      ) : null}
      {meta ? <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">{meta}</p> : null}
      {story.description ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-m-text-secondary)]">
          “{story.description}”
        </p>
      ) : null}
      {story.student_name_display ? (
        <p className="mt-2 text-xs text-[var(--color-m-text-muted)]">
          {i18n.t('profileStorySharedBy', { name: story.student_name_display })}
        </p>
      ) : null}
    </div>
  );
}

export function ProfileSuccessStoriesSection({
  profile,
  sectionRef,
}: {
  profile: DiscoveryFullProfile;
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const tr = useStrings();
  const [expanded, setExpanded] = useState(false);
  const stories = getValidSuccessStories(profile);
  const visible = expanded ? stories : stories.slice(0, INITIAL_COUNT);

  if (stories.length === 0) return null;

  return (
    <ProfileSectionWrapper id="successStories" heading={tr.successStories} sectionRef={sectionRef}>
      <div className="space-y-3">
        {visible.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}

        {stories.length > INITIAL_COUNT ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? tr.profileSuccessStoriesShowFewer : tr.profileSuccessStoriesViewAll}
          </Button>
        ) : null}
      </div>
    </ProfileSectionWrapper>
  );
}
