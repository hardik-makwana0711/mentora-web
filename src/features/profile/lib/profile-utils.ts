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

type NameSource = { first_name?: string | null; last_name?: string | null } | null | undefined;

/**
 * First / last name for a full name. Uses a stored first + last name when it still matches the full name
 * (so "Ali Can" + "Yılmaz" stays that way), and only splits on the first space as a last resort.
 */
export function nameParts(
  fullName: string,
  ...sources: NameSource[]
): { firstName: string; lastName: string } {
  const norm = (s: string) => s.trim().replace(/\s+/g, ' ');
  const target = norm(fullName);
  for (const src of sources) {
    const first = src?.first_name?.trim();
    if (!first) continue;
    const last = src?.last_name?.trim() ?? '';
    if (norm(joinFullName(first, last)) === target) return { firstName: first, lastName: last };
  }
  return splitFullName(fullName);
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
