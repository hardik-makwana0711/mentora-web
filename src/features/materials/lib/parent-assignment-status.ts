import type { SubmissionStatus } from '@/services/materials.service';

export type ParentDisplayStatus =
  | SubmissionStatus
  | 'due_tomorrow'
  | 'overdue';

export function resolveParentDisplayStatus(
  submissionStatus: SubmissionStatus | null | undefined,
  dueDate: string | null | undefined,
  now = new Date()
): ParentDisplayStatus | null {
  if (!dueDate) return submissionStatus ?? null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return submissionStatus ?? null;

  const isSubmitted =
    submissionStatus === 'submitted' ||
    submissionStatus === 'late' ||
    submissionStatus === 'resubmitted';

  if (!isSubmitted) {
    const msUntilDue = due.getTime() - now.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (msUntilDue < 0) return 'overdue';
    if (msUntilDue <= oneDayMs) return 'due_tomorrow';
    return 'not_submitted';
  }

  return submissionStatus ?? 'submitted';
}
