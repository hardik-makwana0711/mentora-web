import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import type { SponsoredCampaignPlacement, SponsoredCampaignStatus } from '@/types/marketing';

export const PHASE1_PLACEMENTS: SponsoredCampaignPlacement[] = [
  'search_results',
  'discovery_feed',
  'lessons_page',
  'student_dashboard',
  'parent_dashboard',
];

export const ALL_PLACEMENTS: SponsoredCampaignPlacement[] = [
  ...PHASE1_PLACEMENTS,
  'mentor_dashboard',
];

export const PLACEMENT_LABEL_KEYS: Record<SponsoredCampaignPlacement, string> = {
  search_results: 'marketingPlacementSearchResults',
  discovery_feed: 'marketingPlacementDiscoveryFeed',
  lessons_page: 'marketingPlacementLessonsPage',
  student_dashboard: 'marketingPlacementStudentDashboard',
  parent_dashboard: 'marketingPlacementParentDashboard',
  mentor_dashboard: 'marketingPlacementMentorDashboard',
};

export const ROLE_LABEL_KEYS: Record<string, string> = {
  parent: 'marketingRoleParent',
  student: 'marketingRoleStudent',
  mentor: 'marketingRoleMentor',
};

export const LANGUAGE_LABEL_KEYS: Record<string, string> = {
  en: 'marketingLanguageEn',
  tr: 'marketingLanguageTr',
};

export const PLATFORM_LABEL_KEYS: Record<string, string> = {
  ios: 'marketingPlatformIos',
  android: 'marketingPlatformAndroid',
  web: 'marketingPlatformWeb',
};

export const EXAM_TYPE_OPTIONS = ['LGS', 'TYT', 'AYT', 'school support'] as const;

export const PRIORITY_PRESETS = {
  low: 25,
  normal: 50,
  high: 75,
} as const;

export function isCampaignEnded(campaign: { endDate: string; status: SponsoredCampaignStatus }): boolean {
  if (campaign.status === 'deleted' || campaign.status === 'draft') return false;
  const end = new Date(campaign.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return end < today;
}

export function displayCampaignStatus(
  status: SponsoredCampaignStatus,
  endDate: string
): SponsoredCampaignStatus | 'ended' {
  if (isCampaignEnded({ status, endDate }) && status !== 'paused' && status !== 'deleted') {
    return 'ended';
  }
  return status;
}

export function formatCtr(ctr: number): string {
  return `${(ctr * 100).toFixed(1)}%`;
}

export function formatGradeLabel(grade: number, tr: { marketingGradeN: string }): string {
  return tr.marketingGradeN.replace('{{n}}', String(grade));
}

type LanguageStrings = {
  marketingLanguageEn: string;
  marketingLanguageTr: string;
};

export function getLanguageLabel(tr: LanguageStrings, language: string): string {
  const key = LANGUAGE_LABEL_KEYS[language];
  if (!key) return language;
  return tr[key as keyof LanguageStrings];
}

export function formatCampaignDate(date: string | Date, locale: Locale): string {
  return format(new Date(date), 'PP', { locale });
}

export function gradeToTargetString(grade: number): string {
  return `Grade ${grade}`;
}

export function parseGradeFromTarget(targetGrade?: string | null): number | null {
  if (!targetGrade) return null;
  const match = targetGrade.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}
