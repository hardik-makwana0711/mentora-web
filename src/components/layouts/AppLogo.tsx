import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';

/** Sidebar / header brand mark — matches portal mockups (M icon + Mentora wordmark). */
export function AppLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const tr = useStrings();
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-m-primary)] to-[var(--color-m-gradient-end)] font-bold text-white shadow-[var(--shadow-m-glow)]',
          compact ? 'size-8 text-sm' : 'size-9 text-base'
        )}
        aria-hidden
      >
        M
      </span>
      <span
        className={cn(
          'font-bold tracking-[-0.02em] text-[var(--color-m-text)]',
          compact ? 'text-base' : 'text-[1.35rem] leading-tight'
        )}
      >
        {tr.appName}
      </span>
    </div>
  );
}
