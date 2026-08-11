import i18n from '@/i18n';
import type { ListingGradeLevel, ListingLessonFormat, ListingStatus, ListingSubject } from '@/types/listings';

const SUBJECT_KEYS: Record<ListingSubject, string> = {
  mathematics: 'listingSubjectMathematics',
  physics: 'listingSubjectPhysics',
  chemistry: 'listingSubjectChemistry',
  biology: 'listingSubjectBiology',
  english: 'listingSubjectEnglish',
  computer_science: 'listingSubjectComputerScience',
  history: 'listingSubjectHistory',
  economics: 'listingSubjectEconomics',
};

const GRADE_KEYS: Record<ListingGradeLevel, string> = {
  primary: 'listingGradePrimary',
  middle_school: 'listingGradeMiddleSchool',
  high_school: 'listingGradeHighSchool',
};

const FORMAT_KEYS: Record<ListingLessonFormat, string> = {
  one_to_one: 'listingFormatOneToOne',
  group: 'listingFormatGroup',
};

export const LISTING_SUBJECTS: { value: ListingSubject; labelKey: string }[] = [
  { value: 'mathematics', labelKey: SUBJECT_KEYS.mathematics },
  { value: 'physics', labelKey: SUBJECT_KEYS.physics },
  { value: 'chemistry', labelKey: SUBJECT_KEYS.chemistry },
  { value: 'biology', labelKey: SUBJECT_KEYS.biology },
  { value: 'english', labelKey: SUBJECT_KEYS.english },
  { value: 'computer_science', labelKey: SUBJECT_KEYS.computer_science },
  { value: 'history', labelKey: SUBJECT_KEYS.history },
  { value: 'economics', labelKey: SUBJECT_KEYS.economics },
];

export const LISTING_GRADE_LEVELS: { value: ListingGradeLevel; labelKey: string }[] = [
  { value: 'primary', labelKey: GRADE_KEYS.primary },
  { value: 'middle_school', labelKey: GRADE_KEYS.middle_school },
  { value: 'high_school', labelKey: GRADE_KEYS.high_school },
];

export const LISTING_LESSON_FORMATS: { value: ListingLessonFormat; labelKey: string }[] = [
  { value: 'one_to_one', labelKey: FORMAT_KEYS.one_to_one },
  { value: 'group', labelKey: FORMAT_KEYS.group },
];

export function formatSubject(value: string): string {
  const key = SUBJECT_KEYS[value as ListingSubject];
  if (key) return i18n.t(key);
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatGradeLevel(value: string): string {
  const key = GRADE_KEYS[value as ListingGradeLevel];
  if (key) return i18n.t(key);
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatGradeLevels(values: string[]): string {
  return values.map(formatGradeLevel).join(', ');
}

export function formatLessonFormat(value: ListingLessonFormat | string): string {
  const key = FORMAT_KEYS[value as ListingLessonFormat];
  return key ? i18n.t(key) : value;
}

export function formatListingStatus(value: ListingStatus | string): string {
  if (value === 'active') return i18n.t('listingStatusActive');
  if (value === 'inactive') return i18n.t('listingStatusInactive');
  return value;
}
