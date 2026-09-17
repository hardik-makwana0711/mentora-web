import type {
  ExamProficiency,
  ExamProficiencyPatchItem,
  PrimaryUniversity,
  SubjectProficiency,
  SubjectProficiencyPatchItem,
  UniversityAttendanceStatus,
} from '@/types/education';
import type { UserRole } from '@/types/user';

/** Mirrors `apps/mobile/src/types/profile.types.ts` + backend `profileService.getMyProfile`. */
export type ProfileRole = Extract<UserRole, 'parent' | 'student' | 'mentor'>;

export interface ProfileCommon {
  profile_photo_url: string | null;
  full_name: string;
  country: string | null;
  location: string | null;
  short_bio: string | null;
  date_of_birth: string | null;
  timezone: string | null;
  profile_completion: number;
}

export interface LinkedStudentRow {
  id: string;
  name: string;
  grade_level?: string | null;
  profile_photo_url?: string | null;
  email?: string | null;
}

export interface ProfileResponse {
  id: string;
  role: ProfileRole;
  email: string;
  phone_number?: string | null;
  account_status?: string;
  common_profile: ProfileCommon;
  sections?: Record<string, boolean>;
  student_profile?: {
    grade_level: string | null;
    school_name: string | null;
    learning_goal: string | null;
    enrolled_subjects: unknown[];
    current_mentors: unknown[];
    total_lessons_completed: number;
    quizzes_solved: number;
  };
  parent_profile?: {
    linked_students: LinkedStudentRow[];
    wallet_balance: number;
    payment_methods: unknown[];
    billing_address: unknown;
    payment_history: unknown[];
  };
  mentor_profile?: {
    professional_title: string | null;
    long_bio: string | null;
    profile_slogan: string | null;
    department: string | null;
    graduation_year: number | null;
    high_school: string | null;
    teaching_formats: string[];
    teaching_style_tags: string[];
    university: string | null;
    primary_university?: PrimaryUniversity | null;
    university_mapping_uncertain?: boolean;
    subject_proficiencies?: SubjectProficiency[];
    exam_proficiencies?: ExamProficiency[];
    degree: string | null;
    certifications: unknown[];
    teaching_experience: string | null;
    subjects_taught: unknown[];
    expertise_areas: unknown[];
    specializations: unknown[];
    hourly_rate: number | null;
    total_lessons_given: number;
    active_students: number;
    average_rating: number;
    total_reviews: number;
    student_satisfaction_rate: number;
    lesson_completion_rate: number;
    response_time: string | null;
    total_earnings: number;
    pending_payouts: number;
    payment_history: unknown[];
    upcoming_lessons: unknown[];
    past_lessons: unknown[];
    reports_written: number;
    profile_moderation_status?: string;
    has_pending_profile_revision?: boolean;
    pending_profile_revision_status?: string | null;
    profile_rejection_reason?: string | null;
  };
}

/** PATCH `/api/v1/profile/me` — only keys accepted by backend `updateProfileSchema`. */
export type ProfilePatchPayload = Partial<{
  profile_photo_url: string;
  full_name: string;
  country: string;
  location: string;
  short_bio: string;
  date_of_birth: string;
  timezone: string;
  school_name: string;
  grade_level: string;
  learning_goal: string;
  phone_number: string;
  professional_title: string;
  long_bio: string;
  profile_slogan: string;
  department: string;
  graduation_year: number;
  high_school: string;
  teaching_formats: string[];
  teaching_style_tags: string[];
  university: string;
  primary_university_id: string | null;
  university_attendance_status: UniversityAttendanceStatus | null;
  subject_proficiencies: SubjectProficiencyPatchItem[];
  exam_proficiencies: ExamProficiencyPatchItem[];
  degree: string;
  teaching_experience: string;
  certifications: string[];
  subjects_taught: string[];
  expertise_areas: string[];
  specializations: string[];
  hourly_rate: number;
}>;

export type IdentityVerificationStatus = 'not_started' | 'pending' | 'verified' | 'failed';
export type StudentVerificationStatus = 'not_required' | 'pending' | 'approved' | 'rejected';
export type MentorAccessStatus = 'restricted' | 'active';
export type VerificationDocumentType =
  | 'graduation_certificate'
  | 'diploma'
  | 'enrollment_letter'
  | 'other';
export type VerificationDocumentStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationDocument {
  id: string;
  type: VerificationDocumentType;
  status: VerificationDocumentStatus;
  file_url: string;
  original_file_name: string;
  mime_type: string;
  review_notes: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
}

export interface MentorVerificationStatusPayload {
  emailVerified: boolean;
  identityVerificationStatus: IdentityVerificationStatus;
  identityProvider: string | null;
  identitySessionId: string | null;
  identityVerifiedAt: string | null;
  studentVerificationType: 'student_email' | 'recent_graduate' | null;
  studentVerificationStatus: StudentVerificationStatus;
  mentorAccessStatus: MentorAccessStatus;
  schoolEmailVerified: boolean;
  schoolEmailDomain: string | null;
  manualVerificationNotes: string | null;
  manualReviewedBy: string | null;
  manualReviewedAt: string | null;
  documents: VerificationDocument[];
}
