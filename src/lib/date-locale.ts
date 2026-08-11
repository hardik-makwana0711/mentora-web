import { addDays, format, startOfWeek } from 'date-fns';
import { enUS, tr as trDateFns } from 'date-fns/locale';
import i18n from '@/i18n';
import { normalizeAppLocale } from '@/lib/app-locale';

/** Date formatting locale — follows the active UI language. */
export function getDateFnsLocale() {
  return normalizeAppLocale(i18n.resolvedLanguage ?? i18n.language) === 'tr' ? trDateFns : enUS;
}

/** Monday=1 … Sunday=7 labels for availability / calendar headers. */
export function getWeekDays() {
  const locale = getDateFnsLocale();
  const monday = startOfWeek(new Date(2024, 0, 1), { weekStartsOn: 1 });
  return ([1, 2, 3, 4, 5, 6, 7] as const).map((val, i) => {
    const d = addDays(monday, i);
    return {
      val,
      short: format(d, 'EEE', { locale }),
      full: format(d, 'EEEE', { locale }),
    };
  });
}

export { trDateFns };
