import type { SessionCancellationKind } from '@/types/lessons';

export type LessonIssueStatus = 'OPEN' | 'CONFIRMED' | 'REJECTED';
export type LessonIssueKind = 'STUDENT_NO_SHOW' | 'MENTOR_NO_SHOW';

type PersonRef = { id: string; name: string };

export type AdminLessonIssue = {
  report_id: string;
  kind: LessonIssueKind;
  status: LessonIssueStatus;
  note: string | null;
  reporter_role: string;
  counterpart_response: 'agreed' | 'disputed' | null;
  counterpart_note: string | null;
  resolution_note: string | null;
  created_at: string;
  resolved_at: string | null;
  session: {
    id: string;
    scheduled_at: string;
    status: string;
    subject: string;
    mentor: PersonRef;
    student: PersonRef;
  };
};

export type AdminActiveLesson = {
  session_id: string;
  scheduled_at: string;
  status: string;
  reschedule_count: number;
  subject: string;
  mentor: PersonRef;
  student: PersonRef;
  parent: PersonRef | null;
};

export type AdminCancellation = {
  session_id: string;
  scheduled_at: string;
  cancelled_at: string;
  cancellation_kind: SessionCancellationKind | null;
  cancellation_reason: string | null;
  credit_refunded: boolean;
  cancelled_by: (PersonRef & { role: string }) | null;
  subject: string;
  mentor: PersonRef;
  student: PersonRef;
};

export type AdminCancelInput = {
  refund_parent: boolean;
  pay_mentor: boolean;
  reason: string;
};
