import { Link, type LinkProps } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Page back navigation — readable on dark surfaces (not low-contrast purple). */
export function BackLink({ className, children, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        'mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-m-nav-inactive)] transition hover:text-[var(--color-m-text)]',
        className
      )}
      {...props}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
