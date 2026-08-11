import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';
import type { ListingStatus } from '@/types/listings';

export function StatusToggle({
  status,
  onToggle,
  disabled,
  loading,
}: {
  status: ListingStatus;
  onToggle: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const tr = useStrings();
  const isActive = status === 'active';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={isActive ? tr.listingSetInactive : tr.listingSetActive}
      disabled={disabled || loading}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
        isActive ? 'bg-[var(--color-m-primary)]' : 'bg-[var(--color-m-card-border)]',
        (disabled || loading) && 'cursor-not-allowed opacity-60'
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-white shadow transition-transform',
          isActive ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}
