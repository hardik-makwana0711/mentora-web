import type { AxiosError } from 'axios';
import type {
  AdminMentorProfileDetail,
  AdminUserListItem,
  PaginatedResponse,
  ProfileModerationStatus,
} from '@/types/admin';

export type MentorProfileListParams = {
  page?: number;
  limit?: number;
  moderationStatus?: ProfileModerationStatus;
  reviewType?: 'initial_submission' | 'profile_revision';
  search?: string;
};

export function isMentorProfilesListFailure(error: unknown): boolean {
  const ax = error as AxiosError<{ message?: string }>;
  const status = ax.response?.status;
  const message = ax.response?.data?.message ?? '';
  return status === 404 && message.toLowerCase().includes('mentor profile not found');
}

function mentorDisplayName(row: AdminMentorProfileDetail): string {
  const fromPublished = row.publishedProfile?.full_name;
  if (fromPublished) return fromPublished;
  const proposed = row.pendingRevision?.proposedProfileData?.full_name;
  if (typeof proposed === 'string') return proposed;
  return row.mentorId;
}

function userMatchesSearch(user: AdminUserListItem, search: string): boolean {
  const q = search.toLowerCase();
  const name = `${user.first_name} ${user.last_name}`.trim().toLowerCase();
  return user.email.toLowerCase().includes(q) || name.includes(q) || user.id.toLowerCase().includes(q);
}

export function filterMentorProfileRows(
  rows: AdminMentorProfileDetail[],
  params: MentorProfileListParams
): AdminMentorProfileDetail[] {
  let filtered = rows;

  if (params.moderationStatus) {
    filtered = filtered.filter((r) => r.profileModerationStatus === params.moderationStatus);
  }

  if (params.reviewType === 'profile_revision') {
    filtered = filtered.filter((r) => r.pendingRevision != null);
  } else if (params.reviewType === 'initial_submission') {
    filtered = filtered.filter((r) =>
      ['pending_review', 'changes_requested', 'rejected'].includes(r.profileModerationStatus)
    );
  }

  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter((r) => mentorDisplayName(r).toLowerCase().includes(q) || r.mentorId.includes(q));
  }

  return filtered;
}

export async function listMentorProfilesViaUsers(
  params: MentorProfileListParams,
  deps: {
    listUsers: (p: { page?: number; limit?: number; role?: string }) => Promise<PaginatedResponse<AdminUserListItem>>;
    getMentorProfile: (mentorId: string) => Promise<AdminMentorProfileDetail>;
  }
): Promise<PaginatedResponse<AdminMentorProfileDetail>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const search = params.search?.trim();

  const users = await deps.listUsers({
    page,
    limit,
    role: 'mentor',
  });

  let candidates = users.items;
  if (search) {
    candidates = candidates.filter((u) => userMatchesSearch(u, search));
  }

  const settled = await Promise.allSettled(
    candidates.map((u) => deps.getMentorProfile(u.id))
  );

  const items = settled
    .filter((r): r is PromiseFulfilledResult<AdminMentorProfileDetail> => r.status === 'fulfilled')
    .map((r) => r.value);

  const filtered = filterMentorProfileRows(items, {
    ...params,
    search: undefined,
  });

  return {
    items: filtered,
    pagination: users.pagination,
  };
}
