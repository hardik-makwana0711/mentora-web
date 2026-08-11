import type {
  ExamProficiencyPatchItem,
  SubjectProficiency,
  SubjectProficiencyPatchItem,
} from '@/types/education';

export type SubjectProficiencyDraft = SubjectProficiency;

export function proficienciesToPatchPayload(
  proficiencies: SubjectProficiencyDraft[]
): SubjectProficiencyPatchItem[] {
  return proficiencies.map((p) => ({
    subject_id: p.subject_id,
    grade_level_ids: p.grades.map((g) => g.grade_level_id),
  }));
}

export function examProficienciesToPatchPayload(
  ids: string[]
): ExamProficiencyPatchItem[] {
  return ids.map((exam_track_subject_id) => ({ exam_track_subject_id }));
}

export function hasDuplicateSubjectGrade(
  proficiencies: SubjectProficiencyDraft[],
  subjectId: string,
  gradeLevelId: string
): boolean {
  const group = proficiencies.find((p) => p.subject_id === subjectId);
  return group?.grades.some((g) => g.grade_level_id === gradeLevelId) ?? false;
}

export function addSubjectGrade(
  proficiencies: SubjectProficiencyDraft[],
  subjectId: string,
  displayName: string,
  grade: { grade_level_id: string; grade_number: number; display_name: string }
): SubjectProficiencyDraft[] {
  if (hasDuplicateSubjectGrade(proficiencies, subjectId, grade.grade_level_id)) {
    return proficiencies;
  }
  const existing = proficiencies.find((p) => p.subject_id === subjectId);
  if (existing) {
    return proficiencies.map((p) =>
      p.subject_id === subjectId
        ? {
            ...p,
            grades: [...p.grades, grade].sort((a, b) => a.grade_number - b.grade_number),
          }
        : p
    );
  }
  return [
    ...proficiencies,
    {
      subject_id: subjectId,
      display_name: displayName,
      grades: [grade],
    },
  ];
}

export function removeSubjectGrade(
  proficiencies: SubjectProficiencyDraft[],
  subjectId: string,
  gradeLevelId: string
): SubjectProficiencyDraft[] {
  return proficiencies
    .map((p) =>
      p.subject_id === subjectId
        ? { ...p, grades: p.grades.filter((g) => g.grade_level_id !== gradeLevelId) }
        : p
    )
    .filter((p) => p.grades.length > 0);
}

export function removeSubject(
  proficiencies: SubjectProficiencyDraft[],
  subjectId: string
): SubjectProficiencyDraft[] {
  return proficiencies.filter((p) => p.subject_id !== subjectId);
}

export function structuredProficienciesEqual(
  a: SubjectProficiencyDraft[],
  b: SubjectProficiencyDraft[]
): boolean {
  if (a.length !== b.length) return false;
  const sortKey = (p: SubjectProficiencyDraft) =>
    `${p.subject_id}:${p.grades.map((g) => g.grade_level_id).sort().join(',')}`;
  const aKeys = a.map(sortKey).sort();
  const bKeys = b.map(sortKey).sort();
  return aKeys.every((k, i) => k === bKeys[i]);
}

export function examIdsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}
