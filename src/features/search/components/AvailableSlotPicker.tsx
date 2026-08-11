import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { slotPickerItemClass } from '@/lib/button-styles';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import type { AvailabilityWindow } from '@/types/search';

/** Max slots visible before the list scrolls (~10 rows × 2 columns). */
const VISIBLE_SLOT_COUNT = 20;

export function AvailableSlotPicker({
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
  const scrollSlots = slots.length > VISIBLE_SLOT_COUNT;

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.availableSlots}</h2>
      <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
        {selected.length}/{maxSelection} {tr.selectSlotsHint}
      </p>
      <div
        className={cn(
          'mt-4',
          scrollSlots &&
            'lessons-session-scroll max-h-[calc(20*3.25rem+19*0.5rem)] overflow-y-auto overscroll-y-contain pr-1 sm:max-h-[calc(10*3.25rem+9*0.5rem)]'
        )}
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {slots.map((slot) => {
            const isSelected = selectedKeys.has(slot.start);
            const atMax = selected.length >= maxSelection && !isSelected;
            const start = parseISO(slot.start);
            const label = format(start, 'd MMM yyyy, HH:mm', { locale: dateLocale });
            return (
              <li key={slot.start}>
                <button
                  type="button"
                  disabled={atMax}
                  onClick={() => onToggle(slot)}
                  className={slotPickerItemClass(isSelected, atMax)}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
