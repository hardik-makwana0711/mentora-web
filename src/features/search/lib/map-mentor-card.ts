import type { FavouriteMentorSummary, MentorPublicProfileResponse, MentorSearchCard } from '@/types/search';

export function mapFavouriteToLegacySearchCard(fav: FavouriteMentorSummary): MentorSearchCard {
  return {
    mentor_id: fav.mentor_id,
    mentor_name: fav.mentor_name,
    avatar_url: fav.avatar_url,
    short_bio: fav.short_bio,
    university: undefined,
    rating: null,
    review_count: 0,
    starting_price: null,
    subjects: fav.subjects,
    grade_levels: fav.grade_levels,
    listing_count: fav.listing_count,
    is_favourited: true,
  };
}

export function mapPublicProfileToSearchCard(
  profile: MentorPublicProfileResponse,
  fav: FavouriteMentorSummary
): MentorSearchCard {
  const m = profile.mentor;
  return {
    mentor_id: m.id,
    mentor_name: m.name,
    avatar_url: m.avatar_url,
    short_bio: m.bio || fav.short_bio,
    university: m.university,
    university_structured: m.primary_university
      ? {
          id: m.primary_university.id,
          name: m.primary_university.name,
          city: m.primary_university.city,
        }
      : null,
    subjects_structured:
      m.subject_proficiencies?.map((p) => ({
        id: p.subject_id,
        name: p.display_name,
        grades: p.grades.map((g) => g.grade_number),
      })) ?? [],
    exam_subjects:
      m.exam_proficiencies?.map((e) => ({
        id: e.id,
        name: e.display_name,
      })) ?? [],
    verification_status: m.verification_status,
    rating: m.rating,
    review_count: m.review_count,
    starting_price: null,
    subjects: fav.subjects.length ? fav.subjects : profile.listings.map((l) => l.subject),
    grade_levels: fav.grade_levels.length
      ? fav.grade_levels
      : [...new Set(profile.listings.flatMap((l) => l.grade_levels))],
    listing_count: fav.listing_count ?? profile.listings.length,
    is_favourited: true,
  };
}
