import { cn } from '@/lib/utils';

/** Shared pill styles — keep raw `<button>` chips/toggles aligned with `<Button />`. */

export const choicePillClass = (active: boolean, disabled?: boolean) =>
  cn(
    'rounded-full border px-4 py-2 text-sm font-semibold transition',
    active
      ? 'border-[var(--color-m-primary)] bg-[var(--color-m-primary)] text-white shadow-[var(--shadow-m-glow)]'
      : 'border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-nav-inactive)] hover:border-[var(--color-m-primary)]/40 hover:text-[var(--color-m-text)]',
    disabled && 'cursor-not-allowed opacity-60'
  );

export const segmentTrackClass = () =>
  'flex gap-2 rounded-full bg-[var(--color-m-surface-light)] p-1 ring-1 ring-[var(--color-m-card-border)]';

export const segmentOptionClass = (active: boolean, disabled?: boolean) =>
  cn(
    'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition',
    active
      ? 'bg-[var(--color-m-primary)] text-white shadow-[var(--shadow-m-glow)]'
      : 'text-[var(--color-m-nav-inactive)] hover:text-[var(--color-m-text)]',
    disabled && 'cursor-not-allowed opacity-60'
  );

export const slotPickerItemClass = (active: boolean, disabled?: boolean) =>
  cn(
    'w-full rounded-2xl border px-3 py-3 text-left text-sm font-medium transition',
    active
      ? 'border-[var(--color-m-primary)] bg-[var(--color-m-primary)]/20 text-[var(--color-m-text)] ring-1 ring-[var(--color-m-primary)]/30'
      : 'border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-nav-inactive)] hover:border-[var(--color-m-primary)]/40 hover:text-[var(--color-m-text)]',
    disabled && 'cursor-not-allowed opacity-40'
  );

export const countPickerItemClass = (active: boolean) =>
  cn(
    'min-w-[3.5rem] rounded-full border px-4 py-3 text-center text-sm font-semibold transition',
    active
      ? 'border-[var(--color-m-primary)] bg-[var(--color-m-primary)] text-white shadow-[var(--shadow-m-glow)]'
      : 'border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-nav-inactive)] hover:border-[var(--color-m-primary)]/40 hover:text-[var(--color-m-text)]'
  );

export const tabTriggerClass = (active: boolean) =>
  cn(
    'flex-1 rounded-full px-3 py-2 text-sm font-semibold transition',
    active
      ? 'bg-[var(--color-m-primary)] text-white shadow-[var(--shadow-m-glow)]'
      : 'text-[var(--color-m-nav-inactive)] hover:text-[var(--color-m-text)]'
  );

export const iconButtonClass = () =>
  'inline-flex items-center justify-center rounded-full p-2 text-[var(--color-m-nav-inactive)] transition hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]';
