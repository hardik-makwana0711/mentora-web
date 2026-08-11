import type {
  ExamProficiency,
  ListingStructuredInfo,
  StructuredExamSubjectSummary,
  StructuredSubjectSummary,
  SubjectProficiency,
  SubjectProficiencyGrade,
} from '@/types/education';
import i18n from '@/i18n';

export function formatGradeNumbers(grades: number[]): string {
  if (!grades.length) return '';
  const sorted = [...grades].sort((a, b) => a - b);
  if (sorted.length === 1) return String(sorted[0]);

  const isConsecutive = sorted.every((g, i) => i === 0 || g === sorted[i - 1] + 1);
  if (isConsecutive && sorted.length > 1) {
    return `${sorted[0]}–${sorted[sorted.length - 1]}`;
  }
  return sorted.join(', ');
}

export function formatGradesLabel(grades: number[]): string {
  const range = formatGradeNumbers(grades);
  if (!range) return '';
  return i18n.t('gradesRange', { range });
}

export function formatSubjectWithGrades(name: string, grades: number[]): string {
  const range = formatGradeNumbers(grades);
  if (!range) return name;
  return `${name} · ${i18n.t('gradesRange', { range })}`;
}

export function formatGradeList(grades: SubjectProficiencyGrade[]): string {
  return grades.map((g) => g.display_name).join(', ');
}

export function formatSubjectProficiencyLine(proficiency: SubjectProficiency): string {
  const grades = proficiency.grades.map((g) => g.grade_number);
  return formatSubjectWithGrades(proficiency.display_name, grades);
}

export function formatSubjectProficiencyCompact(proficiency: SubjectProficiency): string {
  const gradeNames = proficiency.grades.map((g) => g.display_name).join(' · ');
  return `${proficiency.display_name}\n${gradeNames}`;
}

export function getUniversityDisplayName(
  primaryUniversity?: { name: string; city?: string | null } | null,
  legacyUniversity?: string | null
): string | null {
  if (primaryUniversity?.name) {
    return primaryUniversity.city
      ? `${primaryUniversity.name} · ${primaryUniversity.city}`
      : primaryUniversity.name;
  }
  return legacyUniversity?.trim() || null;
}

export function getAttendanceLabel(status: string | null | undefined): string | null {
  if (status === 'attending') return i18n.t('currentlyAttending');
  if (status === 'graduated') return i18n.t('graduated');
  return null;
}

export function formatStructuredSubjectsForCard(
  subjects: StructuredSubjectSummary[],
  maxVisible = 2
): { visible: string[]; overflow: number } {
  const lines = subjects.map((s) => formatSubjectWithGrades(s.name, s.grades));
  if (lines.length <= maxVisible) return { visible: lines, overflow: 0 };
  return { visible: lines.slice(0, maxVisible), overflow: lines.length - maxVisible };
}

export function formatExamSubjectsForDisplay(examSubjects: StructuredExamSubjectSummary[]): string[] {
  return examSubjects.map((s) => s.name);
}

export function formatListingStructuredTitle(structured: ListingStructuredInfo | null | undefined): string | null {
  if (!structured) return null;
  if (structured.exam_display_name) return structured.exam_display_name;
  if (structured.subject_display_name && structured.grade_levels.length) {
    const grades = structured.grade_levels.map((g) => g.display_name).join(', ');
    return i18n.t('structuredListingSubject', {
      subject: structured.subject_display_name,
      grades,
    });
  }
  if (structured.subject_display_name) return structured.subject_display_name;
  return null;
}

export function formatExamProficiencyList(items: ExamProficiency[]): string[] {
  return items.map((e) => e.display_name);
}
