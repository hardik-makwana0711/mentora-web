import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

/** Header controls: language (TR/EN) + theme toggle — shared across app shells. */
export function AppChromeControls({
  className,
  size = 'sm',
  hideLanguageOnMobile = false,
}: {
  className?: string;
  size?: 'sm' | 'md';
  /** Hide the language switcher below 640 px (the role shell shows it in the menu drawer instead). */
  hideLanguageOnMobile?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LanguageSwitcher
        size={size}
        className={hideLanguageOnMobile ? 'hidden sm:inline-flex' : undefined}
      />
      <ThemeToggle size={size} />
    </div>
  );
}
