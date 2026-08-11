import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { iconButtonClass } from '@/lib/button-styles';
import { cn } from '@/lib/utils';
import { calendarDateKey } from '@/features/lessons/lib/lessons-utils';
import { getDateFnsLocale, getWeekDays } from '@/lib/date-locale';
import { useStrings } from '@/constants/strings';

type Props = {
  sessionDates: string[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
};

export function LessonsCalendar({ sessionDates, selectedDate, onSelectDate }: Props) {
  const tr = useStrings();
  const { t } = useTranslation();
  const dateLocale = getDateFnsLocale();
  const weekdays = useMemo(() => getWeekDays().map((d) => d.short), [dateLocale.code]);

  const [viewMonth, setViewMonth] = useState(() => parseISO(`${selectedDate}T12:00:00`));

  const marked = useMemo(() => new Set(sessionDates.map((d) => calendarDateKey(d))), [sessionDates]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const selected = parseISO(`${selectedDate}T12:00:00`);
  const sessionDaysInMonth = days.filter(
    (day) => isSameMonth(day, viewMonth) && marked.has(format(day, 'yyyy-MM-dd'))
  ).length;

  return (
    <div className="lessons-calendar rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={tr.calendarPrevMonth}
          className={iconButtonClass()}
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-base font-bold capitalize text-[var(--color-m-text)]">
          {format(viewMonth, 'MMMM yyyy', { locale: dateLocale })}
        </p>
        <button
          type="button"
          aria-label={tr.calendarNextMonth}
          className={iconButtonClass()}
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {sessionDaysInMonth > 0 ? (
        <p className="mb-3 text-center text-xs text-[var(--color-m-text-muted)] lg:text-left">
          {t('lessonsCalendarSessionsThisMonth', { count: sessionDaysInMonth })}
        </p>
      ) : null}

      <div className="grid grid-cols-7 gap-1.5">
        {weekdays.map((d) => (
          <span
            key={d}
            className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]"
          >
            {d}
          </span>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, viewMonth);
          const isSelected = isSameDay(day, selected);
          const hasSession = marked.has(key);
          const today = isToday(day);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={cn(
                'relative flex h-10 w-full items-center justify-center rounded-xl text-sm font-medium transition',
                !inMonth && 'text-[var(--color-m-text-disabled)]',
                inMonth && !isSelected && 'text-[var(--color-m-text)] hover:bg-[var(--color-m-surface-light)]',
                today && !isSelected && 'ring-1 ring-[var(--color-m-primary)]/40',
                isSelected &&
                  'bg-[var(--color-m-primary)] text-white shadow-[var(--shadow-m-glow)] hover:bg-[var(--color-m-primary)]'
              )}
            >
              {format(day, 'd')}
              {hasSession ? (
                <span
                  className={cn(
                    'absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full',
                    isSelected ? 'bg-white' : 'bg-[var(--color-m-primary-light)]'
                  )}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
