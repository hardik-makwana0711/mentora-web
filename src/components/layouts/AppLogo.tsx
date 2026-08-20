import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';

const MARK_SRC = '/mentora-mark.png';

const markSize = {
  sm: 'h-8 w-auto max-w-[2.25rem] sm:h-9 sm:max-w-[2.5rem]',
  md: 'h-9 w-auto max-w-[2.5rem] sm:h-10 sm:max-w-[2.75rem]',
  lg: 'h-11 w-auto max-w-[3rem] sm:h-12 sm:max-w-[3.25rem]',
} as const;

/** Cap + 3D M mark from the Mentora brand PDF. */
export function BrandMark({
  className,
  size = 'md',
}: {
  className?: string;
  size?: keyof typeof markSize;
}) {
  return (
    <img
      src={MARK_SRC}
      alt=""
      width={80}
      height={70}
      className={cn('shrink-0 object-contain object-center', markSize[size], className)}
      decoding="async"
    />
  );
}

/** Sidebar / header brand — logo mark + Mentora wordmark. */
export function AppLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const tr = useStrings();
  return (
    <div className={cn('flex min-w-0 items-center gap-2 sm:gap-2.5', className)}>
      <BrandMark size={compact ? 'sm' : 'md'} />
      <span
        className={cn(
          'truncate font-bold tracking-[-0.02em] text-[var(--color-m-text)]',
          compact ? 'text-base' : 'text-[1.2rem] leading-tight sm:text-[1.35rem]'
        )}
      >
        {tr.appName}
      </span>
    </div>
  );
}
