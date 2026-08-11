import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { MentorDashboardData, ParentDashboardData, StudentDashboardData } from '@/types/dashboard';

const noCacheHeaders = {
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

export async function fetchParentDashboard(): Promise<ParentDashboardData> {
  const { data } = await apiClient.get<ParentDashboardData>(endpoints.dashboard.parent, {
    headers: noCacheHeaders,
  });
  return data;
}

export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  const { data } = await apiClient.get<StudentDashboardData>(endpoints.dashboard.student, {
    headers: noCacheHeaders,
  });
  return data;
}

export async function fetchMentorDashboard(): Promise<MentorDashboardData> {
  const { data } = await apiClient.get<MentorDashboardData>(endpoints.dashboard.mentor, {
    headers: noCacheHeaders,
  });
  return data;
}
