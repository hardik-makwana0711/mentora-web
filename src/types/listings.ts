export type ListingSubject =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english'
  | 'computer_science'
  | 'history'
  | 'economics';

export type ListingGradeLevel = 'primary' | 'middle_school' | 'high_school';

export type ListingLessonFormat = 'one_to_one' | 'group';

export type ListingStatus = 'active' | 'inactive';

export type ListingModerationStatus =
  | 'pending_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'hidden_by_admin';

export interface MentorListingStructuredGrade {
  grade_level_id: string;
  grade_number: number;
  display_name: string;
}

export interface MentorListingStructuredSubject {
  id: string;
  display_name: string;
}

export interface MentorListing {
  id: string;
  mentor_id?: string;
  subject: ListingSubject | string;
  subject_id?: string | null;
  exam_track_subject_id?: string | null;
  grade_levels: ListingGradeLevel[] | string[];
  structured_grade_levels?: MentorListingStructuredGrade[];
  structured_subject?: MentorListingStructuredSubject | null;
  structured_exam?: MentorListingStructuredSubject | null;
  lesson_format: ListingLessonFormat;
  description: string;
  status: ListingStatus;
  listing_moderation_status?: ListingModerationStatus;
  moderation_notes?: string | null;
  rejection_reason?: string | null;
  views_count: number;
  bookings_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListingFormPayload {
  subject: ListingSubject;
  grade_levels: ListingGradeLevel[];
  lesson_format: ListingLessonFormat;
  description: string;
}

export interface ToggleListingStatusPayload {
  status: ListingStatus;
}
