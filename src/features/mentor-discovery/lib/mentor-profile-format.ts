import i18n from '@/i18n';
import type { Strings } from '@/constants/strings';

/** Safe fallback for any raw value a mapping table doesn't recognize — never leak snake_case/raw enums to the UI. */
function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/** Backend `mapVerificationBadges()` returns pre-formatted English labels — map the known set. */
const VERIFICATION_BADGE_KEYS: Record<string, keyof Strings> = {
  'Identity Verified': 'verificationIdentityVerified',
  'Education Verified': 'verificationEducationVerified',
  'Background Checked': 'verificationBackgroundChecked',
  'References Checked': 'verificationReferencesChecked',
};

export function verificationBadgeLabel(raw: string): string {
  const key = VERIFICATION_BADGE_KEYS[raw];
  return key ? i18n.t(key) : humanize(raw);
}

/** Backend `TEACHING_STYLE_TAGS` (mentor-profile.constants.ts) */
const TEACHING_STYLE_KEYS: Record<string, keyof Strings> = {
  Patient: 'stylePatient',
  Motivating: 'styleMotivating',
  Disciplined: 'styleDisciplined',
  Friendly: 'styleFriendly',
  'Exam-Oriented': 'styleExamOriented',
  Supportive: 'styleSupportive',
  Structured: 'styleStructured',
  Fun: 'styleFun',
  Calm: 'styleCalm',
  Energetic: 'styleEnergetic',
  'Goal-Oriented': 'styleGoalOriented',
};

export function teachingStyleLabel(raw: string): string {
  const key = TEACHING_STYLE_KEYS[raw];
  return key ? i18n.t(key) : humanize(raw);
}

/** Prisma `achievement_type` enum */
const SUCCESS_CATEGORY_KEYS: Record<string, keyof Strings> = {
  school_admission: 'successCategorySchoolAdmission',
  exam_success: 'successCategoryExamSuccess',
  grade_improvement: 'successCategoryGradeImprovement',
  general_progress: 'successCategoryGeneralProgress',
  other: 'successCategoryOther',
};

export function successStoryCategoryLabel(raw: string | null): string | null {
  if (!raw) return null;
  const key = SUCCESS_CATEGORY_KEYS[raw];
  return key ? i18n.t(key) : humanize(raw);
}

export function lessonFormatLabel(raw: string): string {
  if (raw === 'online') return i18n.t('formatOnline');
  if (raw === 'in_person') return i18n.t('formatInPerson');
  if (raw === 'hybrid') return i18n.t('formatHybrid');
  return humanize(raw);
}

/** "4.8 ★ · 24 reviews" when reviews exist, else "New mentor · No reviews yet". */
export function ratingSummary(ratingAverage: number | null, reviewCount: number): string {
  if (ratingAverage != null && reviewCount > 0) {
    return `${ratingAverage.toFixed(1)} ★ · ${i18n.t('reviewCount', { count: reviewCount })}`;
  }
  return i18n.t('mentorProfileNewNoReviews');
}

/**
 * `grade_levels`/`exam_types` come from mentor-authored free-text fields, not a fixed
 * backend enum — they're already human-readable in practice. This still exists as a
 * reusable formatting seam (per spec's requirement for a grade-level/exam-type mapping
 * function) so any future raw/enum-like value is humanized rather than shown as-is.
 */
export function gradeLevelLabel(raw: string): string {
  return /^[a-z0-9_-]+$/.test(raw) ? humanize(raw) : raw;
}

export function examTypeLabel(raw: string): string {
  return /^[a-z0-9_-]+$/.test(raw) ? humanize(raw) : raw;
}

export function reviewerTypeLabel(reviewerType: string | null, fallbackName: string): string {
  if (reviewerType === 'parent') return i18n.t('roleParent');
  if (reviewerType === 'student') return i18n.t('roleStudent');
  return fallbackName;
}
