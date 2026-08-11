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

export interface MentorVerificationStatusPayload {
  emailVerified: boolean;
  identityVerificationStatus: string;
  studentVerificationStatus: string;
  mentorAccessStatus: string;
}
