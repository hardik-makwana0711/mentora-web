import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[var(--color-surface-border)]/60', className)}
      aria-hidden
    />
  );
}
