import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  ExamSubjectsResponse,
  ExamTrack,
  SubjectsByGradeResponse,
  UniversitiesResponse,
} from '@/types/education';

export const educationService = {
  async searchUniversities(params: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<UniversitiesResponse> {
    const { data } = await apiClient.get<UniversitiesResponse>(endpoints.education.universities, {
      params,
    });
    return data;
  },

  async getSubjectsByGrade(grade: number): Promise<SubjectsByGradeResponse> {
    const { data } = await apiClient.get<SubjectsByGradeResponse>(endpoints.education.subjects, {
      params: { grade },
    });
    return data;
  },

  async getExamSubjects(examTrack: ExamTrack): Promise<ExamSubjectsResponse> {
    const { data } = await apiClient.get<ExamSubjectsResponse>(endpoints.education.examSubjects, {
      params: { exam_track: examTrack },
    });
    return data;
  },
};
