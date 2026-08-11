import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { formatSubject } from '@/features/search/lib/format-labels';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import type { AvailabilityWindow } from '@/types/search';

export function BookingSummaryCard({
  mentorName,
  subject,
  lessonCount,
  slots,
  estimatedTotal,
  studentName,
}: {
  mentorName: string;
  subject: string;
  lessonCount: number;
  slots: AvailabilityWindow[];
  estimatedTotal?: number | null;
  studentName?: string | null;
}) {
  const tr = useStrings();
  const dateLocale = getDateFnsLocale();
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.bookingSummary}</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-m-text-muted)]">{tr.bookingSummaryMentor}</dt>
          <dd className="text-right font-medium text-[var(--color-m-text)]">{mentorName}</dd>
        </div>
        {studentName ? (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-m-text-muted)]">{tr.selectStudent}</dt>
            <dd className="text-right font-medium text-[var(--color-m-text)]">{studentName}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-m-text-muted)]">{tr.bookingSummaryService}</dt>
          <dd className="text-right font-medium capitalize text-[var(--color-m-text)]">{formatSubject(subject)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-m-text-muted)]">{tr.bookingSummaryLessonCount}</dt>
          <dd className="text-right font-medium text-[var(--color-m-text)]">{lessonCount}</dd>
        </div>
        {estimatedTotal != null ? (
          <div className="flex justify-between gap-4 border-t border-[var(--color-m-card-border)] pt-2">
            <dt className="text-[var(--color-m-text-muted)]">{tr.bookingSummaryEstimated}</dt>
            <dd className="text-right font-bold text-[var(--color-m-text)]">
              {estimatedTotal} {tr.creditUnit}
            </dd>
          </div>
        ) : null}
      </dl>
      {slots.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-[var(--color-m-card-border)] pt-4">
          {slots.map((slot) => (
            <li key={slot.start} className="flex items-center gap-2 text-sm text-[var(--color-m-text-secondary)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-brand-primary)]" />
              {format(parseISO(slot.start), 'd MMM yyyy, HH:mm', { locale: dateLocale })} –{' '}
              {format(parseISO(slot.end), 'HH:mm', { locale: dateLocale })}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
