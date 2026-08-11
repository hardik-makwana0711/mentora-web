export type ReportTargetType =
  | 'mentor_profile'
  | 'listing'
  | 'photo'
  | 'video'
  | 'review'
  | 'success_story';

export type ReportReasonCategory =
  | 'inappropriate_content'
  | 'false_information'
  | 'safety_concern'
  | 'spam'
  | 'other';

export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';

export interface CreateReportInput {
  target_type: ReportTargetType;
  target_id: string;
  reason_category: ReportReasonCategory;
  description?: string;
}

export interface ContentReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reasonCategory: ReportReasonCategory;
  description: string | null;
  status: ReportStatus;
  reporterUserId: string;
  createdAt: string | Date;
}

export interface ReportListResponse {
  items: ContentReport[];
  pagination: { page: number; limit: number; total: number };
}
