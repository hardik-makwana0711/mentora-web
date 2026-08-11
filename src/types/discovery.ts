import type { ExamProficiency, PrimaryUniversity, SubjectProficiency } from '@/types/education';

export interface DiscoveryHighlightedReview {
  reviewer_name_display: string;
  review_text: string;
}

export interface DiscoveryHighlightedSuccessStory {
  title: string;
  institution_name: string | null;
  year: number | null;
}

export interface DiscoveryMentorCard {
  mentor_id: string;
  display_name: string;
  title: string | null;
  short_bio: string | null;
  profile_slogan: string | null;
  primary_photo_url: string | null;
  additional_photos: string[];
  rating_average: number | null;
  review_count: number;
  subjects: string[];
  exam_types: string[];
  grade_levels: string[];
  teaching_style_tags: string[];
  verification_badges: string[];
  is_saved: boolean;
  highlighted_review: DiscoveryHighlightedReview | null;
  highlighted_success_story: DiscoveryHighlightedSuccessStory | null;
  /** Present on saved mentors list when mentor is no longer public */
  mentor_unavailable?: boolean;
  last_saved_at?: string | null;
}

export interface DiscoveryFeedResponse {
  items: DiscoveryMentorCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface DiscoveryFilters {
  subject?: string;
  exam_type?: string;
  grade_level?: string;
  teaching_format?: 'online' | 'in_person' | 'hybrid';
  min_rating?: number;
  tags?: string;
  page?: number;
  limit?: number;
  include_seen?: boolean;
  student_id?: string;
}

export interface DiscoveryProfilePhoto {
  id: string;
  url: string;
  thumbnail_url: string | null;
  order: number;
  is_primary: boolean;
}

export interface DiscoveryProfileReview {
  id: string;
  rating: number | null;
  review_text: string;
  reviewer_name_display: string;
  reviewer_type: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface DiscoveryProfileSuccessStory {
  id: string;
  title: string;
  description: string;
  student_name_display: string | null;
  institution_name: string | null;
  exam_type: string | null;
  year: number | null;
  created_at: string;
}

export interface DiscoveryFullProfile {
  mentor_id: string;
  display_name: string;
  title: string | null;
  short_bio: string | null;
  long_bio: string | null;
  profile_slogan: string | null;
  education: {
    university: string | null;
    department: string | null;
    degree: string | null;
    graduation_year: number | null;
    high_school: string | null;
    primary_university: PrimaryUniversity | null;
    certifications: string[] | null;
  };
  photos: DiscoveryProfilePhoto[];
  intro_video: {
    url: string;
    thumbnail_url: string | null;
    duration_seconds: number | null;
  } | null;
  subjects: string[];
  exam_types: string[];
  grade_levels: string[];
  teaching_formats: string[];
  teaching_style_tags: string[];
  subject_proficiencies?: SubjectProficiency[];
  exam_proficiencies?: ExamProficiency[];
  verification_badges: string[];
  rating_average: number | null;
  review_count: number;
  profile_completeness_score: number | null;
  reviews: DiscoveryProfileReview[];
  success_stories: DiscoveryProfileSuccessStory[];
  availability_summary: {
    next_available_slots: Array<{ slot_start: string; slot_end: string }>;
  };
  pricing_summary: {
    hourly_rate: number | null;
    lesson_formats: string[];
  };
}
