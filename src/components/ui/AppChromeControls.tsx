import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

/** Header controls: language (TR/EN) + theme toggle — shared across app shells. */
export function AppChromeControls({
  className,
  size = 'sm',
}: {
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LanguageSwitcher size={size} />
      <ThemeToggle size={size} />
    </div>
  );
}
