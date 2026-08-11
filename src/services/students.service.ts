import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export interface StudentSignupInput {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
}

export interface StudentSignupResponse {
  message: string;
  studentId: string;
  user?: Record<string, unknown>;
}

export const studentsService = {
  async createStudent(input: StudentSignupInput): Promise<StudentSignupResponse> {
    const { data } = await apiClient.post<StudentSignupResponse>(
      endpoints.auth.studentSignup,
      input
    );
    return data;
  },
};
