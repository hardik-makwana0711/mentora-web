export type ProfileModerationStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'hidden_by_admin';

export type ListingModerationStatus =
  | 'pending_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'hidden_by_admin';

export type AccountStatus = 'active' | 'pending' | 'suspended';

export type UserRoleAdmin = 'parent' | 'student' | 'mentor' | 'admin';

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
}

export interface AdminDashboardStats {
  users: { total: number; active: number; suspended: number };
  mentors: { total: number; active: number; suspended: number };
  verifications: { pending: number };
  profileModeration: Record<ProfileModerationStatus, number>;
  listingModeration: Record<ListingModerationStatus, number>;
  suspended: { total: number };
}

export interface AdminMentorVerificationListItem {
  mentor_id: string;
  email: string;
  school_email_domain: string | null;
  identity_verification_status: string;
  student_verification_status: string;
  mentor_access_status: string;
  pending_documents: Array<{
    id: string;
    type: string;
    status: string;
    uploaded_at: string;
    file_url: string;
    original_file_name: string;
  }>;
  last_reviewed_at: string | null;
  last_reviewed_by: string | null;
  created_at: string;
}

export interface AdminMentorVerificationDetail {
  mentor: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
  verification: Record<string, unknown>;
  documents: Array<{
    id: string;
    type: string;
    status: string;
    uploaded_at: string;
    file_url: string;
    original_file_name: string;
    reviewed_at?: string | null;
    review_notes?: string | null;
  }>;
}

export interface AdminMentorProfilePublished {
  full_name: string | null;
  profile_photo_url: string | null;
  short_bio: string | null;
  professional_title: string | null;
  university: string | null;
  degree: string | null;
  teaching_experience: string | null;
  subjects_taught: string[];
  expertise_areas: string[];
  specializations: string[];
  hourly_rate: number | null;
}

export interface AdminMentorProfileRevision {
  id: string;
  status: string;
  proposedProfileData: Record<string, unknown>;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedByAdminId: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
}

export interface AdminMentorProfileDetail {
  mentorId: string;
  mentorAccessStatus: string;
  profileModerationStatus: ProfileModerationStatus;
  publishedProfile: AdminMentorProfilePublished | null;
  pendingRevision: AdminMentorProfileRevision | null;
}

export interface AdminListingListItem {
  id: string;
  mentor_id: string;
  status: string;
  lesson_format: string;
  listing_moderation_status: ListingModerationStatus;
  submitted_for_review_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
}

export interface AdminListingDetail {
  listingId: string;
  listingModerationStatus: ListingModerationStatus;
  availabilityStatus: string;
  mentor: {
    mentorId: string;
    name: string;
    avatarUrl: string | null;
  };
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  reviewedByAdminId: string | null;
}

export interface AdminUserListItem {
  id: string;
  role: UserRoleAdmin;
  email: string;
  first_name: string;
  last_name: string;
  account_status: AccountStatus;
  created_at: string;
}

export interface AdminUserDetail {
  user: AdminUserListItem;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: AdminPagination;
}
