import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button variants (portal mockups):
 * - primary: solid purple gradient pill — main CTAs
 * - secondary: dark surface + white text — cancel, back, refresh
 * - outline: alias of secondary (legacy)
 * - ghost: minimal text control — toolbars, modal dismiss labels
 * - danger: destructive confirm
 */
const variants = {
  primary: '',
  secondary:
    'border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-text)] hover:bg-[var(--color-m-surface-elevated)]',
  outline:
    'border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-text)] hover:bg-[var(--color-m-surface-elevated)]',
  ghost:
    'border border-transparent bg-transparent text-[var(--color-m-nav-inactive)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]',
  danger: 'bg-[var(--color-m-error)] text-[var(--color-m-text)] hover:opacity-90',
} as const;

const sizes = {
  sm: 'h-9 gap-2 px-4 text-[13px]',
  md: 'h-11 gap-2 px-5 text-[15px]',
  lg: 'h-[52px] gap-2 px-6 text-[16px]',
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

const pillBase =
  'inline-flex items-center justify-center rounded-full font-semibold tracking-[0.2px] transition-[background-color,opacity,transform] active:scale-[0.98]';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  type = 'button',
  fullWidth,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  if (variant === 'primary') {
    return (
      <button
        type={type}
        className={cn(
          pillBase,
          sizes[size],
          fullWidth && 'w-full',
          isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          'bg-gradient-to-r from-[var(--color-m-primary)] to-[var(--color-m-gradient-end)] text-white shadow-[var(--shadow-m-glow)]',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <span className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
        ) : (
          children
        )}
      </button>
    );
  }

  return (
    <button
      type={type}
      className={cn(
        pillBase,
        sizes[size],
        variants[variant],
        fullWidth && 'w-full',
        isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span
          className={cn(
            'size-5 animate-spin rounded-full border-2 border-t-transparent',
            variant === 'ghost' ? 'border-white/35 border-t-white' : 'border-white/35 border-t-white'
          )}
        />
      ) : (
        children
      )}
    </button>
  );
}
