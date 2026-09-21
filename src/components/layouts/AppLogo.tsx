import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';

/** Sidebar / header brand mark — matches portal mockups (M icon + Mentora wordmark). */
export function AppLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  const tr = useStrings();
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/master-icon.png"
        alt=""
        aria-hidden
        className={cn('shrink-0 object-contain', compact ? 'size-8' : 'size-9')}
      />
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
