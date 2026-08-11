import { Moon, Sun } from 'lucide-react';
import { useAppTheme } from '@/app/providers/ThemeProvider';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
  className?: string;
  size?: 'sm' | 'md';
};

export function ThemeToggle({ className, size = 'sm' }: ThemeToggleProps) {
  const tr = useStrings();
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? tr.themeSwitchToLight : tr.themeSwitchToDark}
      title={isDark ? tr.themeLight : tr.themeDark}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-text-secondary)] shadow-sm ring-1 ring-[var(--color-m-ring-subtle)] transition hover:border-[var(--color-m-primary)]/40 hover:text-[var(--color-m-text)]',
        size === 'md' ? 'size-10' : 'size-9',
        className
      )}
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
