import type { LucideIcon } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';
import { cn } from '@/lib/utils';

type DashboardEmptyStateProps = {
  title: string;
  description?: string;
  buttonText?: string;
  onPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  icon?: LucideIcon;
  compact?: boolean;
};

export function DashboardEmptyState({
  title,
  description,
  buttonText,
  onPress,
  secondaryButtonText,
  onSecondaryPress,
  icon: Icon = Calendar,
  compact = false,
}: DashboardEmptyStateProps) {
  return (
    <DashboardPanelCard
      className={cn(
        'flex flex-col items-center text-center',
        compact ? 'py-5' : 'py-8'
      )}
    >
      <div
        className={cn(
          'mb-3 flex items-center justify-center rounded-2xl bg-[var(--color-brand-primary)]/15',
          compact ? 'size-12' : 'mb-4 size-16'
        )}
      >
        <Icon
          className={cn(compact ? 'size-6' : 'size-8', 'text-[var(--color-brand-primary)]')}
          aria-hidden
        />
      </div>
      <h3
        className={cn(
          'font-semibold text-[var(--color-m-text)]',
          compact ? 'text-base' : 'text-lg'
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={cn(
            'max-w-sm text-sm text-[var(--color-text-muted)]',
            compact ? 'mt-1' : 'mt-2'
          )}
        >
          {description}
        </p>
      ) : null}
      {(buttonText && onPress) || (secondaryButtonText && onSecondaryPress) ? (
        <div className={cn('flex flex-wrap items-center justify-center gap-2', compact ? 'mt-3' : 'mt-5')}>
          {buttonText && onPress ? (
            <Button type="button" size="sm" onClick={onPress}>
              {buttonText}
            </Button>
          ) : null}
          {secondaryButtonText && onSecondaryPress ? (
            <Button type="button" size="sm" variant="secondary" onClick={onSecondaryPress}>
              {secondaryButtonText}
            </Button>
          ) : null}
        </div>
      ) : null}
    </DashboardPanelCard>
  );
}
