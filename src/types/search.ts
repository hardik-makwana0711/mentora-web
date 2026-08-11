import type {
  ExamProficiency,
  ListingStructuredInfo,
  PrimaryUniversity,
  StructuredExamSubjectSummary,
  StructuredSubjectSummary,
  SubjectProficiency,
} from '@/types/education';

export type LessonFormat = 'one_to_one' | 'group';
export type VerificationStatus = 'verified' | 'pending' | 'not_started' | string;

export interface SearchFilters {
  q?: string;
  /** Legacy alias sent to API as `search_query` (mobile parity). */
  search_query?: string;
  subject?: string;
  grade_level?: string;
  lesson_format?: LessonFormat;
  university_id?: string;
  subject_id?: string;
  grade?: number;
  exam_track_subject_id?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

/** UI-only metadata for structured filter chips (not sent to API). */
export interface StructuredFilterLabels {
  university_name?: string;
  subject_name?: string;
  grade_display?: string;
  exam_subject_name?: string;
}

export interface MentorSearchCard {
  mentor_id: string;
  mentor_name: string;
  avatar_url?: string | null;
  short_bio?: string;
  university?: string;
  university_structured?: Pick<PrimaryUniversity, 'id' | 'name' | 'city'> | null;
  subjects_structured?: StructuredSubjectSummary[];
  exam_subjects?: StructuredExamSubjectSummary[];
  verification_status?: VerificationStatus;
  rating: number | null;
  review_count: number;
  starting_price: number | null;
  subjects: string[];
  grade_levels: string[];
  listing_count?: number;
  is_favourited: boolean;
  /** False when mentor is hidden, suspended, or profile not approved (mobile parity). */
  is_available?: boolean;
}

export interface MentorSearchResult {
  items: MentorSearchCard[];
  pagination: { total: number; page: number; limit: number };
}

export interface PublicListingSummary {
  id: string;
  subject: string;
  grade_levels: string[];
  structured?: ListingStructuredInfo | null;
  lesson_format: LessonFormat;
  description: string;
  views_count: number;
  bookings_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  is_favourited?: boolean;
}

export interface MentorPublicProfile {
  id: string;
  name: string;
  avatar_url?: string | null;
  bio: string;
  university?: string;
  primary_university?: PrimaryUniversity | null;
  subject_proficiencies?: SubjectProficiency[];
  exam_proficiencies?: ExamProficiency[];
  verification_status: VerificationStatus;
  rating: number | null;
  review_count: number;
  is_favourited?: boolean;
}

export interface ViewerPermissions {
  can_favourite: boolean;
  can_book: boolean;
  reason: string | null;
}

export interface MentorPublicProfileResponse {
  mentor: MentorPublicProfile;
  listings: PublicListingSummary[];
  viewer_permissions: ViewerPermissions;
}

export interface PublicListingDetailResponse {
  listing: {
    id: string;
    subject: string;
    grade_levels: string[];
    lesson_format: LessonFormat;
    description: string;
    views_count: number;
    bookings_count: number;
    status: 'active' | 'inactive';
    price?: number;
    is_favourited?: boolean;
  };
  mentor: {
    id: string;
    name: string;
    avatar_url?: string | null;
    university?: string;
    verification_status: VerificationStatus;
    is_favourited?: boolean;
  };
  viewer_permissions: {
    can_book: boolean;
    can_favourite: boolean;
  };
}

export interface AvailabilityWindow {
  start: string;
  end: string;
  slot_id?: string;
}

export interface MentorAvailabilitySlot {
  slot_id: string;
  db_slot_id: string;
  mentor_id: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'blocked' | 'reserved' | 'booked' | string;
}

export interface ListingAvailableSlotsResponse {
  listingId: string;
  mentorId: string;
  slotDurationMinutes: number;
  availableSlots: {
    date: string;
    slots: { start: string; end: string }[];
  }[];
}

export interface FavouriteMentorSummary {
  mentor_id: string;
  mentor_name: string;
  avatar_url?: string | null;
  short_bio?: string;
  subjects: string[];
  grade_levels: string[];
  listing_count?: number;
  /** True for every row from GET /favourites/mentors (list is only favourited mentors). */
  is_favourited?: boolean;
  is_available?: boolean;
}

export interface FavouriteListingSummary {
  listing_id: string;
  subject: string;
  description?: string;
  grade_levels?: string[];
  lesson_format?: LessonFormat;
  price?: number;
  mentor_id?: string;
  mentor?: { id: string; name: string; avatar_url?: string | null };
}
