import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { CreateReportInput, ContentReport, ReportListResponse, ReportStatus } from '@/types/reports';

export const reportsService = {
  async create(input: CreateReportInput): Promise<ContentReport> {
    const { data } = await apiClient.post<{ report: ContentReport }>(endpoints.reports.create, input);
    return data.report;
  },

  async adminList(params?: {
    page?: number;
    limit?: number;
    status?: ReportStatus;
    target_type?: string;
  }): Promise<ReportListResponse> {
    const { data } = await apiClient.get<ReportListResponse>(endpoints.reports.adminList, { params });
    return data;
  },

  async adminGetDetail(reportId: string): Promise<ContentReport> {
    const { data } = await apiClient.get<{ report: ContentReport }>(endpoints.reports.adminDetail(reportId));
    return data.report;
  },

  async adminMarkUnderReview(reportId: string): Promise<ContentReport> {
    const { data } = await apiClient.post<{ report: ContentReport }>(
      endpoints.reports.adminMarkUnderReview(reportId)
    );
    return data.report;
  },

  async adminResolve(reportId: string, adminNotes?: string): Promise<ContentReport> {
    const { data } = await apiClient.post<{ report: ContentReport }>(endpoints.reports.adminResolve(reportId), {
      admin_notes: adminNotes,
    });
    return data.report;
  },

  async adminDismiss(reportId: string, adminNotes?: string): Promise<ContentReport> {
    const { data } = await apiClient.post<{ report: ContentReport }>(endpoints.reports.adminDismiss(reportId), {
      admin_notes: adminNotes,
    });
    return data.report;
  },
};
