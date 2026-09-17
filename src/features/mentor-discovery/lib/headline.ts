import i18n from '@/i18n';
import type { DiscoveryFullProfile } from '@/types/discovery';

const GENERIC_TITLES = new Set(['senior mentor', 'mentor', 'tutor']);

function isGenericTitle(title: string): boolean {
  return GENERIC_TITLES.has(title.trim().toLowerCase());
}

/**
 * Builds a useful profile headline from the mentor's own subjects/exam-track data
 * instead of a generic title — never fabricates subjects or exam tracks that
 * aren't actually present on the profile.
 */
export function buildMentorHeadline(
  profile: Pick<DiscoveryFullProfile, 'title' | 'subjects' | 'exam_types'>
): string | null {
  if (profile.title?.trim() && !isGenericTitle(profile.title)) return profile.title.trim();

  const subject = profile.subjects[0];
  if (!subject) return profile.title?.trim() || null;

  if (profile.exam_types.length > 0) {
    return i18n.t('profileHeadlineSubjectAndExam', {
      subject,
      exam: profile.exam_types.join(' & '),
    });
  }
  return i18n.t('profileHeadlineSubjectOnly', { subject });
}
