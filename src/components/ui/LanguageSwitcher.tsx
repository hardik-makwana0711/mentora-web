import { useAppLocale } from '@/hooks/use-app-locale';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import type { AppLocale } from '@/lib/app-locale';

type LanguageSwitcherProps = {
  className?: string;
  size?: 'sm' | 'md';
};

const OPTIONS: { value: AppLocale; label: string }[] = [
  { value: 'tr', label: 'TR' },
  { value: 'en', label: 'EN' },
];

export function LanguageSwitcher({ className, size = 'sm' }: LanguageSwitcherProps) {
  const tr = useStrings();
  const { locale, setLocale } = useAppLocale();

  return (
    <div
      role="group"
      aria-label={tr.languageSwitcherAria}
      className={cn(
        'inline-flex rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-0.5 shadow-sm ring-1 ring-[var(--color-m-ring-subtle)]',
        size === 'md' ? 'h-10' : 'h-9',
        className
      )}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            aria-label={opt.value === 'tr' ? tr.languageTr : tr.languageEn}
            onClick={() => setLocale(opt.value)}
            className={cn(
              'min-w-[2.75rem] rounded-full px-3 text-xs font-bold tracking-wide transition-all',
              size === 'md' ? 'text-sm' : 'text-xs',
              active
                ? 'bg-[var(--color-m-primary)] text-white shadow-[var(--shadow-m-glow)]'
                : 'text-[var(--color-m-text-muted)] hover:text-[var(--color-m-text-secondary)]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
