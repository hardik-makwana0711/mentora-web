import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';

export function Spinner({ className }: { className?: string }) {
  const tr = useStrings();
  return (
    <span
      role="status"
      aria-label={tr.loadingAria}
      className={cn('inline-block size-8 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--color-m-text)_20%,transparent)] border-t-white', className)}
    />
  );
}
