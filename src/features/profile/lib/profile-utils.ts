import { format, parseISO, isValid } from 'date-fns';
import i18n from '@/i18n';
import { getDateFnsLocale } from '@/lib/date-locale';

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const t = fullName.trim();
  if (!t) return { firstName: '', lastName: '' };
  const i = t.indexOf(' ');
  if (i === -1) return { firstName: t, lastName: '' };
  return { firstName: t.slice(0, i).trim(), lastName: t.slice(i + 1).trim() };
}

export function joinFullName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(' ');
}

export function formatOptionalDate(iso: string | null | undefined): string {
  if (!iso) return i18n.t('notProvided');
  try {
    const d = parseISO(iso);
    if (!isValid(d)) return i18n.t('notProvided');
    return format(d, 'd MMMM yyyy', { locale: getDateFnsLocale() });
  } catch {
    return i18n.t('notProvided');
  }
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = parseISO(iso);
    if (!isValid(d)) return '';
    return format(d, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

export function mentorVerificationLabel(status: string | undefined): string {
  if (!status) return i18n.t('notProvided');
  const map: Record<string, string> = {
    not_started: i18n.t('verificationNotStarted'),
    pending: i18n.t('verificationPending'),
    verified: i18n.t('verificationVerified'),
    failed: i18n.t('verificationFailed'),
  };
  return map[status] ?? status;
}
