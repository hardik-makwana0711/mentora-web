import type { EducationLevel } from '@/types/education';

export const EDUCATION_LEVELS: { value: EducationLevel; labelKey: 'educationPrimary' | 'educationMiddle' | 'educationHigh' }[] = [
  { value: 'primary', labelKey: 'educationPrimary' },
  { value: 'middle', labelKey: 'educationMiddle' },
  { value: 'high', labelKey: 'educationHigh' },
];

export const GRADES_BY_EDUCATION_LEVEL: Record<EducationLevel, number[]> = {
  primary: [1, 2, 3, 4],
  middle: [5, 6, 7, 8],
  high: [9, 10, 11, 12],
};

export const EXAM_TRACKS = ['LGS', 'TYT', 'AYT'] as const;

export function educationLevelForGrade(grade: number): EducationLevel {
  if (grade <= 4) return 'primary';
  if (grade <= 8) return 'middle';
  return 'high';
}

export function gradeDisplayName(grade: number): string {
  return `${grade}. Sınıf`;
}
