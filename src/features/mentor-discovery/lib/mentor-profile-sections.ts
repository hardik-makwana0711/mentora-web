import type { Strings } from '@/constants/strings';
import type {
  DiscoveryFullProfile,
  DiscoveryProfileReview,
  DiscoveryProfileSuccessStory,
} from '@/types/discovery';

export type ProfileSectionId =
  | 'overview'
  | 'subjects'
  | 'teachingStyle'
  | 'services'
  | 'availability'
  | 'video'
  | 'education'
  | 'reviews'
  | 'successStories';

const NAV_LABEL_KEYS: Record<ProfileSectionId, keyof Strings> = {
  overview: 'profileNavOverview',
  subjects: 'profileNavSubjects',
  teachingStyle: 'profileNavTeachingStyle',
  services: 'profileNavServices',
  availability: 'profileNavAvailability',
  video: 'profileNavVideo',
  education: 'profileNavEducation',
  reviews: 'profileNavReviews',
  successStories: 'profileNavSuccessStories',
};

/** Reviews with no rating and no text carry nothing evaluable — drop them rather than show blank cards. */
export function getValidReviews(profile: DiscoveryFullProfile): DiscoveryProfileReview[] {
  return profile.reviews.filter((r) => Boolean(r.rating) || Boolean(r.review_text?.trim()));
}

/** Success stories with neither a title nor a description are empty test/placeholder rows — drop them. */
export function getValidSuccessStories(
  profile: DiscoveryFullProfile
): DiscoveryProfileSuccessStory[] {
  return profile.success_stories.filter(
    (s) => Boolean(s.title?.trim()) || Boolean(s.description?.trim())
  );
}

export function hasEducationContent(profile: DiscoveryFullProfile): boolean {
  const edu = profile.education;
  return Boolean(
    edu.university ||
    edu.primary_university?.name ||
    edu.department ||
    edu.degree ||
    edu.high_school
  );
}

function sectionHasContent(id: ProfileSectionId, profile: DiscoveryFullProfile): boolean {
  switch (id) {
    case 'overview':
      return Boolean(
        profile.short_bio?.trim() || profile.long_bio?.trim() || profile.profile_slogan?.trim()
      );
    case 'subjects':
      return (
        profile.subjects.length > 0 ||
        profile.grade_levels.length > 0 ||
        profile.exam_types.length > 0 ||
        profile.teaching_formats.length > 0
      );
    case 'teachingStyle':
      return profile.teaching_style_tags.length > 0;
    case 'services':
      // Always shown — listings load from a second, independently-timed query, so this
      // can't be gated on data that isn't available yet when getVisibleSections runs. Has
      // a defined empty state, same as video/reviews.
      return true;
    case 'availability':
      return (
        profile.teaching_formats.length > 0 ||
        profile.availability_summary.next_available_slots.length > 0
      );
    case 'video':
      // Always shown — a "no video available" fallback is real content, per the spec's
      // explicit requirement to show that fallback rather than hiding the section.
      return true;
    case 'education':
      return hasEducationContent(profile);
    case 'reviews':
      // Always reachable — it has a defined empty state.
      return true;
    case 'successStories':
      return getValidSuccessStories(profile).length > 0;
    default:
      return false;
  }
}

const ORDER: ProfileSectionId[] = [
  'overview',
  'subjects',
  'teachingStyle',
  'services',
  'availability',
  'video',
  'education',
  'reviews',
  'successStories',
];

export function getVisibleSections(
  profile: DiscoveryFullProfile
): { id: ProfileSectionId; labelKey: keyof Strings }[] {
  return ORDER.filter((id) => sectionHasContent(id, profile)).map((id) => ({
    id,
    labelKey: NAV_LABEL_KEYS[id],
  }));
}
