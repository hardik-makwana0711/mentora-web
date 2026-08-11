import { format, isBefore, parseISO, startOfDay } from 'date-fns';
import i18n from '@/i18n';
import { getDateFnsLocale } from '@/lib/date-locale';
import type {
  LessonSessionListItem,
  MentorLessonCard,
  ParentSubjectCard,
  PastGroupCard,
  StudentSubjectCard,
} from '@/types/lessons';

/** Normalize API date fields (calendar uses scheduled_at; session list uses session_date). */
export function sessionScheduledAt(session: {
  scheduled_at?: string;
  session_date?: string;
}): string | undefined {
  return session.scheduled_at ?? session.session_date;
}

export function formatLessonDateTime(iso?: string | null): string {
  if (!iso) return i18n.t('noDate');
  try {
    return format(parseISO(iso), 'd MMM yyyy HH:mm', { locale: getDateFnsLocale() });
  } catch {
    return i18n.t('noDate');
  }
}

export function formatLessonDate(iso?: string | null): string {
  if (!iso) return i18n.t('noDate');
  try {
    return format(parseISO(iso), 'd MMM yyyy', { locale: getDateFnsLocale() });
  } catch {
    return i18n.t('noDate');
  }
}

export function formatLessonTime(iso?: string | null): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'HH:mm', { locale: getDateFnsLocale() });
  } catch {
    return '';
  }
}

export function isPastLessonGroup(nextSessionDate: string | null | undefined, upcomingCount?: number): boolean {
  if (upcomingCount === 0) return true;
  if (!nextSessionDate) return false;
  try {
    return isBefore(parseISO(nextSessionDate), startOfDay(new Date()));
  } catch {
    return false;
  }
}

export function sessionStatusLabel(status?: string): string {
  const map: Record<string, string> = {
    scheduled: 'sessionStatusPlanned',
    completed: 'sessionStatusCompleted',
    cancelled: 'sessionStatusCancelled',
    rescheduled: 'sessionStatusRescheduled',
    in_progress: 'sessionStatusInProgress',
  };
  if (!status) return '';
  const key = map[status.toLowerCase()];
  return key ? i18n.t(key) : status;
}

/** Prefer translated listing labels; otherwise clean enum-style values. */
export function formatLessonServiceName(name?: string | null): string {
  if (!name) return i18n.t('lessonDefaultTitle');
  const trimmed = name.trim();
  if (!trimmed) return i18n.t('lessonDefaultTitle');
  // Lazy import avoided: keep formatting local + listing subject keys mirrored here.
  const subjectKeys: Record<string, string> = {
    mathematics: 'listingSubjectMathematics',
    physics: 'listingSubjectPhysics',
    chemistry: 'listingSubjectChemistry',
    biology: 'listingSubjectBiology',
    english: 'listingSubjectEnglish',
    computer_science: 'listingSubjectComputerScience',
    history: 'listingSubjectHistory',
    economics: 'listingSubjectEconomics',
  };
  const key = subjectKeys[trimmed.toLowerCase()];
  if (key) return i18n.t(key);
  if (trimmed.includes('_')) {
    return trimmed
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
  return trimmed;
}

export type SessionReportUiStatus =
  | 'ready'
  | 'processing'
  | 'none'
  | 'not_completed'
  | 'unknown'
  | 'waiting_lesson';

export function reportStatusLabel(status: SessionReportUiStatus): string {
  const map: Record<SessionReportUiStatus, string> = {
    ready: 'reportStatusReady',
    processing: 'reportStatusProcessing',
    none: 'reportStatusNone',
    not_completed: 'reportStatusNotCompleted',
    unknown: 'reportStatusUnknown',
    waiting_lesson: 'reportStatusWaitingLesson',
  };
  return i18n.t(map[status]);
}

/** Infer report UI status from session badge/status when AI report fields are unavailable. */
export function inferReportStatusFromSessionStatus(status?: string | null): SessionReportUiStatus {
  const s = (status ?? '').toLowerCase();
  if (!s) return 'unknown';
  if (s === 'scheduled' || s === 'rescheduled' || s === 'in_progress') return 'waiting_lesson';
  if (s === 'cancelled') return 'none';
  if (s === 'completed') return 'processing';
  return 'unknown';
}

export function canOpenLessonReport(status?: string | null): boolean {
  const s = (status ?? '').toLowerCase();
  return s === 'completed' || s === 'cancelled';
}

export function shouldShowReportCta(status?: string | null): 'report' | 'status' | 'hide' {
  const s = (status ?? '').toLowerCase();
  if (s === 'completed') return 'report';
  if (s === 'scheduled' || s === 'rescheduled' || s === 'in_progress') return 'status';
  return 'hide';
}

export function pastGroupSessionCountLabel(count: number): string {
  if (count === 1) return i18n.t('lessonsSessionCountOne');
  return i18n.t('lessonsSessionCount', { count });
}

export type LessonsSummaryStats = {
  upcomingCount: number;
  completedCount: number;
  reportsReadyCount: number | null;
  reportsPendingCount: number | null;
  totalHours: number | null;
  todayCount: number;
};

export function computeLessonsSummaryStats(input: {
  upcomingSessions: { duration_minutes?: number; scheduled_at?: string; session_date?: string }[];
  pastGroups: PastGroupCard[];
}): LessonsSummaryStats {
  const upcomingCount = input.upcomingSessions.length;
  const completedCount = input.pastGroups.reduce((sum, g) => sum + pastGroupSessionCount(g), 0);
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayCount = input.upcomingSessions.filter((s) => {
    const raw = sessionScheduledAt(s);
    return raw?.startsWith(todayKey);
  }).length;

  // TODO: reports-ready / reports-pending counts are not exposed by the dashboard API yet.
  const reportsReadyCount: number | null = null;
  const reportsPendingCount: number | null = null;

  let totalMinutes = input.upcomingSessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
  let hasHourSource = input.upcomingSessions.some((s) => s.duration_minutes != null && s.duration_minutes > 0);

  for (const g of input.pastGroups) {
    if ('total_hours' in g && typeof g.total_hours === 'number' && g.total_hours > 0) {
      totalMinutes += g.total_hours * 60;
      hasHourSource = true;
    }
  }

  return {
    upcomingCount,
    completedCount,
    reportsReadyCount,
    reportsPendingCount,
    totalHours: hasHourSource ? Math.round((totalMinutes / 60) * 10) / 10 : null,
    todayCount,
  };
}

export function sessionStatusFromItem(item: LessonSessionListItem): string | undefined {
  return item.badge ?? undefined;
}

export function calendarDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function filterSessionsByDate<T extends { scheduled_at?: string; session_date?: string }>(
  sessions: T[],
  dateKey: string
): T[] {
  return sessions
    .filter((s) => {
      const raw = sessionScheduledAt(s);
      return raw?.startsWith(dateKey);
    })
    .sort((a, b) => {
      const da = sessionScheduledAt(a);
      const db = sessionScheduledAt(b);
      return new Date(da ?? 0).getTime() - new Date(db ?? 0).getTime();
    });
}

export function sortPastGroups<T extends { next_session_date?: string | null; upcoming_session_count?: number }>(
  groups: T[]
): T[] {
  return [...groups].sort((a, b) => {
    const aPast = isPastLessonGroup(a.next_session_date, a.upcoming_session_count);
    const bPast = isPastLessonGroup(b.next_session_date, b.upcoming_session_count);
    if (aPast !== bPast) return aPast ? -1 : 1;
    if (!a.next_session_date && !b.next_session_date) return 0;
    if (!a.next_session_date) return 1;
    if (!b.next_session_date) return -1;
    return new Date(b.next_session_date).getTime() - new Date(a.next_session_date).getTime();
  });
}

function groupUpcomingCount(card: PastGroupCard): number {
  if ('upcoming_session_count' in card && card.upcoming_session_count != null) {
    return card.upcoming_session_count;
  }
  return 0;
}

/** True when the group has at least one non-upcoming session (history list is non-empty). */
export function hasPastLessonHistory(card: PastGroupCard): boolean {
  if ('total_sessions' in card) {
    if (card.total_sessions <= 0) return false;
    const pastCount = card.total_sessions - groupUpcomingCount(card);
    return pastCount > 0;
  }

  if ('total_hours' in card) {
    if (card.total_hours <= 0) return false;
    const upcoming = groupUpcomingCount(card);
    if (upcoming === 0) return true;
    return isPastLessonGroup(card.next_session_date, upcoming);
  }

  return false;
}

/** One row per lesson; parent “all students” can still have many distinct lessons. */
export function dedupePastGroupsByLessonId(groups: PastGroupCard[]): PastGroupCard[] {
  const byLesson = new Map<string, PastGroupCard>();
  for (const card of groups) {
    const existing = byLesson.get(card.lesson_id);
    if (!existing) {
      byLesson.set(card.lesson_id, card);
      continue;
    }
    const existingPast =
      'total_sessions' in existing
        ? existing.total_sessions - groupUpcomingCount(existing)
        : existing.total_hours;
    const cardPast =
      'total_sessions' in card ? card.total_sessions - groupUpcomingCount(card) : card.total_hours;
    if (cardPast > existingPast) byLesson.set(card.lesson_id, card);
  }
  return [...byLesson.values()];
}

/** Past tab: only groups with real history (not upcoming-only). */
export function pastGroupsFromDashboard(
  role: 'mentor' | 'student' | 'parent',
  dash: {
    student_cards?: MentorLessonCard[];
    subject_cards?: StudentSubjectCard[] | ParentSubjectCard[];
  }
): PastGroupCard[] {
  const groups: PastGroupCard[] =
    role === 'mentor' ? (dash.student_cards ?? []) : (dash.subject_cards ?? []);
  return sortPastGroups(dedupePastGroupsByLessonId(groups.filter(hasPastLessonHistory)));
}

export function pastGroupTitle(card: PastGroupCard, role: 'mentor' | 'student' | 'parent'): string {
  if (role === 'mentor') {
    if ('lesson_subject' in card && card.lesson_subject) return card.lesson_subject;
    if ('subject_name' in card && card.subject_name) return card.subject_name;
  }
  if (role === 'mentor' && 'student_name' in card) return card.student_name;
  if ('subject_name' in card) return card.subject_name;
  if ('lesson_subject' in card) return card.lesson_subject;
  return i18n.t('lessonDefaultTitle');
}

export function pastGroupSubtitle(card: PastGroupCard, role: 'mentor' | 'student' | 'parent'): string {
  if (role === 'mentor' && 'student_name' in card) return card.student_name;
  if (role === 'parent' && 'student_name' in card && 'mentor_name' in card) {
    return `${card.student_name} · ${card.mentor_name}`;
  }
  if ('mentor_name' in card && card.mentor_name) return card.mentor_name;
  if ('student_name' in card && card.student_name) return card.student_name;
  return '';
}

/** Session count label for past group cards (past sessions, not total enrollment). */
export function pastGroupSessionCount(card: PastGroupCard): number {
  if ('total_sessions' in card) {
    return Math.max(card.total_sessions - groupUpcomingCount(card), 0);
  }
  if ('total_hours' in card) return Math.max(Math.round(card.total_hours), 0);
  return 0;
}
