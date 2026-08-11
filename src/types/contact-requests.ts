export type ContactRequestType = 'contact' | 'trial' | 'regular_lesson';
export type ContactRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface ContactRequestPerson {
  id: string;
  name: string;
  email?: string;
}

export interface ContactRequest {
  id: string;
  mentorId: string;
  mentor: ContactRequestPerson | null;
  requesterUserId: string;
  requester: ContactRequestPerson | null;
  studentId: string | null;
  student: Pick<ContactRequestPerson, 'id' | 'name'> | null;
  requestType: ContactRequestType;
  subject: string | null;
  examType: string | null;
  gradeLevel: string | null;
  preferredTeachingFormat: string | null;
  preferredDays: string[];
  preferredTimeSlots: string[];
  preferredSchedule: string | null;
  message: string | null;
  status: ContactRequestStatus;
  mentorResponseMessage: string | null;
  respondedAt: string | Date | null;
  createdAt: string | Date;
}

export interface ContactRequestListResponse {
  items: ContactRequest[];
  pagination: { page: number; limit: number; total: number };
}

export interface CreateContactRequestInput {
  request_type: ContactRequestType;
  student_id?: string;
  subject: string;
  exam_type?: string;
  grade_level: string;
  preferred_teaching_format?: string;
  preferred_days?: string[];
  preferred_time_slots?: string[];
  message?: string;
}
