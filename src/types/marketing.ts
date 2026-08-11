export type SponsoredCampaignPlacement =
  | 'student_dashboard'
  | 'parent_dashboard'
  | 'mentor_dashboard'
  | 'discovery_feed'
  | 'search_results'
  | 'lessons_page';

export type SponsoredCampaignLanguage = 'en' | 'tr';

export type SponsoredCampaignStatus = 'draft' | 'active' | 'paused' | 'deleted';

export type SponsoredCampaignPlatform = 'ios' | 'android' | 'web';

export type SponsoredTargetRole = 'parent' | 'student' | 'mentor';

export type SponsoredCampaign = {
  id: string;
  internalName: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  ctaText?: string | null;
  ctaUrl: string;
  sponsorLabel?: string | null;
  badgeText?: string | null;
  status: SponsoredCampaignStatus;
  language: SponsoredCampaignLanguage;
  platform?: SponsoredCampaignPlatform | null;
  priority: number;
  startDate: string;
  endDate: string;
  targetGrade?: string | null;
  targetSubject?: string | null;
  targetExamType?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  isGeneral: boolean;
  roles: SponsoredTargetRole[];
  placements: SponsoredCampaignPlacement[];
  createdByAdminId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SponsoredCampaignListParams = {
  page?: number;
  limit?: number;
  status?: SponsoredCampaignStatus;
  placement?: SponsoredCampaignPlacement;
  language?: SponsoredCampaignLanguage;
  platform?: SponsoredCampaignPlatform;
  role?: SponsoredTargetRole;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortBy?: 'created_at' | 'start_date' | 'end_date' | 'priority' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
};

export type CreateSponsoredCampaignPayload = {
  internalName: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  ctaText?: string;
  ctaUrl: string;
  sponsorLabel?: string;
  badgeText?: string;
  status?: SponsoredCampaignStatus;
  language: SponsoredCampaignLanguage;
  platform?: SponsoredCampaignPlatform | null;
  priority?: number;
  startDate: string;
  endDate: string;
  roles: SponsoredTargetRole[];
  placements: SponsoredCampaignPlacement[];
  targetGrade?: string;
  targetSubject?: string;
  targetExamType?: string;
  minAge?: number;
  maxAge?: number;
  isGeneral?: boolean;
};

export type UpdateSponsoredCampaignPayload = Partial<CreateSponsoredCampaignPayload>;

export type SponsoredCampaignMetrics = {
  campaignId: string;
  internalName: string;
  title: string;
  dateRange: { startDate: string | null; endDate: string | null };
  totals: { impressions: number; clicks: number; ctr: number };
  byPlacement: Array<{
    placement: SponsoredCampaignPlacement;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  byPlatform: Array<{
    platform: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
};

export type SponsoredCardPublic = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  ctaText?: string | null;
  ctaUrl: string;
  sponsorLabel?: string | null;
  badgeText?: string | null;
};

export type SponsoredCardQuery = {
  placement: SponsoredCampaignPlacement;
  platform?: SponsoredCampaignPlatform;
  language?: SponsoredCampaignLanguage;
  student_id?: string;
  subject?: string;
  exam_type?: string;
};

export type SponsoredCardSelection = {
  card: SponsoredCardPublic | null;
  context?: Record<string, unknown>;
};

export type TrackingPayload = {
  placement: SponsoredCampaignPlacement;
  platform?: SponsoredCampaignPlatform;
};
