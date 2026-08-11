import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** In-app text link — readable on dark backgrounds (not low-contrast purple outline). */
export function TextLink({ className, children, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        'font-medium text-[var(--color-m-text-secondary)] underline-offset-2 transition hover:text-[var(--color-m-text)] hover:underline',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function TextButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'font-medium text-[var(--color-m-text-secondary)] underline-offset-2 transition hover:text-[var(--color-m-text)] hover:underline',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
