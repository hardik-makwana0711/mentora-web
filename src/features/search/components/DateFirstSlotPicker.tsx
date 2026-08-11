import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { slotPickerItemClass } from '@/lib/button-styles';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import type { AvailabilityWindow } from '@/types/search';

interface DateGroup {
  date: Date;
  dateLabel: string;
  dateKey: string;
  slots: AvailabilityWindow[];
}

function groupSlotsByDate(slots: AvailabilityWindow[], dateLocale: ReturnType<typeof getDateFnsLocale>): DateGroup[] {
  const map = new Map<string, AvailabilityWindow[]>();
  for (const slot of slots) {
    const key = slot.start.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, slotList]) => {
      const date = parseISO(key + 'T12:00:00');
      return {
        date,
        dateLabel: format(date, 'd MMM yyyy, EEEE', { locale: dateLocale }),
        dateKey: key,
        slots: slotList.sort((a, b) => a.start.localeCompare(b.start)),
      };
    });
}

export function DateFirstSlotPicker({
  slots,
  selected,
  maxSelection,
  isLoading,
  isError,
  onRetry,
  onToggle,
}: {
  slots: AvailabilityWindow[];
  selected: AvailabilityWindow[];
  maxSelection: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onToggle: (slot: AvailabilityWindow) => void;
}) {
  const tr = useStrings();
  const dateLocale = getDateFnsLocale();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dateGroups = useMemo(() => groupSlotsByDate(slots, dateLocale), [slots, dateLocale]);

  const activeDate = selectedDate ?? dateGroups[0]?.dateKey ?? null;
  const activeDateSlots = dateGroups.find((g) => g.dateKey === activeDate)?.slots ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-8 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        <span className="sr-only">{tr.slotsLoading}</span>
      </div>
    );
  }

  if (isError) {
    return <ErrorState title={tr.slotsLoadError} onRetry={onRetry} />;
  }

  if (!slots.length) {
    return <EmptyState title={tr.slotsEmpty} />;
  }

  const selectedKeys = new Set(selected.map((x) => x.start));

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.availableSlots}</h2>
      <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
        {selected.length}/{maxSelection} {tr.selectSlotsHint}
      </p>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
          {tr.bookingStepSelectDate}
        </p>
        <div className="flex flex-wrap gap-2">
          {dateGroups.map((group) => {
            const isActive = group.dateKey === activeDate;
            const hasSelected = group.slots.some((sl) => selectedKeys.has(sl.start));
            return (
              <button
                key={group.dateKey}
                type="button"
                onClick={() => setSelectedDate(group.dateKey)}
                className={cn(
                  'relative rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/20 text-[var(--color-m-text)]'
                    : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-secondary)] hover:border-[var(--color-brand-primary)]/50 hover:text-[var(--color-m-text)]'
                )}
              >
                {format(group.date, 'd MMM', { locale: dateLocale })}
                <span className="ml-1 text-xs text-[var(--color-m-text-muted)]">
                  {format(group.date, 'EEE', { locale: dateLocale })}
                </span>
                {hasSelected && (
                  <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-[9px] font-bold text-[var(--color-m-text)]">
                    {group.slots.filter((sl) => selectedKeys.has(sl.start)).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeDate && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.bookingStepSelectTime}
          </p>
          <p className="mb-3 text-sm text-[var(--color-m-text)] capitalize">
            {dateGroups.find((g) => g.dateKey === activeDate)?.dateLabel}
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {activeDateSlots.map((slot) => {
              const isSelected = selectedKeys.has(slot.start);
              const atMax = selected.length >= maxSelection && !isSelected;
              const label = format(parseISO(slot.start), 'HH:mm');
              const endLabel = format(parseISO(slot.end), 'HH:mm');
              return (
                <li key={slot.start}>
                  <button
                    type="button"
                    disabled={atMax}
                    onClick={() => onToggle(slot)}
                    className={slotPickerItemClass(isSelected, atMax)}
                  >
                    {label} – {endLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
