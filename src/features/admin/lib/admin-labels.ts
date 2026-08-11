import type { ProfileModerationStatus, ListingModerationStatus } from '@/types/admin';

const PROFILE_LABELS: Record<ProfileModerationStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
  rejected: 'Rejected',
  hidden_by_admin: 'Hidden by Admin',
};

const LISTING_LABELS: Record<ListingModerationStatus, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
  rejected: 'Rejected',
  hidden_by_admin: 'Hidden by Admin',
};

export function formatProfileModerationStatus(status: string): string {
  return PROFILE_LABELS[status as ProfileModerationStatus] ?? status;
}

export function formatListingModerationStatus(status: string): string {
  return LISTING_LABELS[status as ListingModerationStatus] ?? status;
}

export function formatAccountStatus(status: string): string {
  if (status === 'active') return 'Active';
  if (status === 'suspended') return 'Suspended';
  if (status === 'pending') return 'Pending';
  return status;
}

export function formatUserRole(role: string): string {
  if (role === 'admin') return 'Admin';
  if (role === 'mentor') return 'Mentor';
  if (role === 'parent') return 'Parent';
  if (role === 'student') return 'Student';
  return role;
}
