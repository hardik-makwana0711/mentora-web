import i18n from '@/i18n';

export type MentorStructuredFieldErrors = {
  university?: string;
  attendance?: string;
  subjects?: string;
  exams?: string;
};

const CODE_MAP: Record<string, keyof MentorStructuredFieldErrors> = {
  INVALID_UNIVERSITY: 'university',
  INVALID_SUBJECT: 'subjects',
  INVALID_SUBJECT_GRADE_COMBINATION: 'subjects',
  INVALID_EXAM_SUBJECT: 'exams',
  INVALID_EXAM_TRACK: 'exams',
};

export function mapMentorProfileSaveError(message: string): MentorStructuredFieldErrors {
  const code = message.trim();
  const field = CODE_MAP[code];
  if (field) {
    return {
      university: field === 'university' ? i18n.t('profileErrorInvalidUniversity') : undefined,
      subjects: field === 'subjects' ? i18n.t('profileErrorInvalidSubjectGrade') : undefined,
      exams: field === 'exams' ? i18n.t('profileErrorInvalidExamSubject') : undefined,
    };
  }

  const lower = code.toLowerCase();
  const errors: MentorStructuredFieldErrors = {};
  if (lower.includes('primary_university') || lower.includes('university_attendance')) {
    errors.university = code;
    errors.attendance = code;
  }
  if (lower.includes('subject_proficienc')) errors.subjects = code;
  if (lower.includes('exam_proficienc')) errors.exams = code;
  return errors;
}
