import { Globe } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { cn } from '@/lib/utils';

type LanguageToggleProps = {
  className?: string;
  size?: 'sm' | 'md';
  /** @deprecated Use LanguageSwitcher — kept for backward compatibility */
  compact?: boolean;
};

/** @deprecated Prefer `LanguageSwitcher` or `AppChromeControls` */
export function LanguageToggle({ className, size = 'sm', compact }: LanguageToggleProps) {
  if (compact) {
    return <LanguageSwitcher className={className} size={size} />;
  }
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Globe className="size-4 text-[var(--color-m-text-muted)]" aria-hidden />
      <LanguageSwitcher size={size} />
    </div>
  );
}
