import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/token-storage';

export type MaterialType = 'assignment' | 'course_resource';
export type MaterialStatus = 'active' | 'archived' | 'deleted';
export type SubmissionStatus = 'not_submitted' | 'submitted' | 'late' | 'resubmitted';

export interface MaterialSubmission {
  id?: string;
  studentId: string;
  studentName: string;
  parentName?: string | null;
  submissionStatus?: SubmissionStatus | null;
  status?: SubmissionStatus | null;
  submittedAt?: string | null;
  submittedFileUrl?: string | null;
  submittedFileName?: string | null;
}

export interface TeacherMaterial {
  id: string;
  teacherId?: string;
  teacherName?: string;
  title: string;
  description?: string | null;
  type: MaterialType;
  fileUrl: string;
  fileName?: string | null;
  fileMimeType?: string | null;
  fileSize?: number | null;
  assignedStudentIds?: string[];
  assignedStudentCount?: number;
  dueDate?: string | null;
  submissionCount?: number | null;
  submissionStatus?: SubmissionStatus | null;
  submittedAt?: string | null;
  status?: MaterialStatus;
  createdAt?: string;
  updatedAt?: string;
  assignedStudents?: MaterialSubmission[];
  submission?: {
    status?: SubmissionStatus | null;
    submittedAt?: string | null;
    submittedFileUrl?: string | null;
    submittedFileName?: string | null;
  } | null;
  childName?: string;
}

export interface MaterialListFilters {
  type?: MaterialType;
  status?: MaterialStatus;
  studentId?: string;
}

export interface CreateMaterialInput {
  title: string;
  description?: string;
  type: MaterialType;
  dueDate?: string;
  assignedStudentIds: string[];
  file: File;
}

export interface UpdateMaterialInput {
  title?: string;
  description?: string;
  dueDate?: string | null;
  assignedStudentIds?: string[];
  status?: MaterialStatus;
}

function normalizeSubmissionRow(row: MaterialSubmission): MaterialSubmission {
  const status = row.submissionStatus ?? row.status ?? 'not_submitted';
  return { ...row, status, submissionStatus: status };
}

function normalizeMaterial(material: TeacherMaterial): TeacherMaterial {
  const assignedStudents = material.assignedStudents?.map(normalizeSubmissionRow);
  const submissionStatus =
    material.submissionStatus ??
    material.submission?.status ??
    (material.type === 'assignment' ? 'not_submitted' : null);

  return {
    ...material,
    assignedStudents,
    submissionStatus,
    submission:
      material.submission ??
      (material.type === 'assignment'
        ? {
            status: submissionStatus,
            submittedAt: material.submittedAt ?? null,
            submittedFileUrl: null,
          }
        : null),
  };
}

function unwrapList(data: unknown): TeacherMaterial[] {
  if (Array.isArray(data)) return data.map((row) => normalizeMaterial(row as TeacherMaterial));
  const wrapped = data as { materials?: TeacherMaterial[] };
  return (wrapped.materials ?? []).map(normalizeMaterial);
}

function unwrapMaterial(data: unknown): TeacherMaterial {
  const wrapped = data as { material?: TeacherMaterial } & TeacherMaterial;
  const material = wrapped.material ?? wrapped;
  return normalizeMaterial(material);
}

async function uploadMultipart(url: string, formData: FormData): Promise<unknown> {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const token = tokenStorage.getAccessToken();
  const res = await fetch(`${base}${url}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Security-Tunnel': 'hardened',
    },
    body: formData,
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: unknown;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(json.message ?? 'Upload failed');
  }
  if (json.success && json.data !== undefined) return json.data;
  return json;
}

export const materialsService = {
  async getMentorMaterials(filters: MaterialListFilters = {}): Promise<TeacherMaterial[]> {
    const { data } = await apiClient.get(endpoints.materials.mentor.list, { params: filters });
    return unwrapList(data);
  },

  async getMentorMaterial(materialId: string): Promise<TeacherMaterial> {
    const { data } = await apiClient.get(endpoints.materials.mentor.detail(materialId));
    return unwrapMaterial(data);
  },

  async createMentorMaterial(input: CreateMaterialInput): Promise<TeacherMaterial> {
    const formData = new FormData();
    formData.append('title', input.title);
    formData.append('type', input.type);
    formData.append('description', input.description ?? '');
    if (input.type === 'assignment' && input.dueDate) {
      formData.append('dueDate', input.dueDate);
    }
    // Backend multipart create expects assignedStudentIds as JSON string or comma-separated
    // (see mentor-materials.validation.ts). Do not also send assignedStudentIds[] — that
    // merges into an array with the JSON string and fails UUID validation on index 1.
    formData.append('assignedStudentIds', JSON.stringify(input.assignedStudentIds));
    formData.append('file', input.file);

    const data = await uploadMultipart(endpoints.materials.mentor.list, formData);
    return unwrapMaterial(data);
  },

  async updateMentorMaterial(materialId: string, input: UpdateMaterialInput): Promise<TeacherMaterial> {
    const { data } = await apiClient.patch(endpoints.materials.mentor.detail(materialId), input);
    return unwrapMaterial(data);
  },

  async archiveMentorMaterial(materialId: string): Promise<void> {
    await apiClient.delete(endpoints.materials.mentor.detail(materialId));
  },

  async getStudentMaterials(filters: MaterialListFilters = {}): Promise<TeacherMaterial[]> {
    const { data } = await apiClient.get(endpoints.materials.student.list, { params: filters });
    return unwrapList(data);
  },

  async getStudentMaterial(materialId: string): Promise<TeacherMaterial> {
    const { data } = await apiClient.get(endpoints.materials.student.detail(materialId));
    return unwrapMaterial(data);
  },

  async submitAssignment(assignmentId: string, file: File): Promise<TeacherMaterial['submission']> {
    const formData = new FormData();
    formData.append('file', file);

    const data = await uploadMultipart(endpoints.materials.student.submit(assignmentId), formData);
    const wrapped = data as { submission?: TeacherMaterial['submission'] };
    return wrapped.submission ?? null;
  },

  async getParentMaterials(studentId: string, filters: MaterialListFilters = {}): Promise<TeacherMaterial[]> {
    const { data } = await apiClient.get(endpoints.materials.parent.list(studentId), { params: filters });
    return unwrapList(data);
  },

  async getParentMaterial(studentId: string, materialId: string): Promise<TeacherMaterial> {
    const { data } = await apiClient.get(endpoints.materials.parent.detail(studentId, materialId));
    return unwrapMaterial(data);
  },
};
