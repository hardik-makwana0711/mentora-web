import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--color-brand-accent)]/30 bg-[var(--color-surface-card)] px-6 py-10 text-center"
    >
      <AlertTriangle className="size-10 text-[var(--color-brand-accent)]" aria-hidden />
      <div>
        <p className="text-base font-medium text-[var(--color-text-primary)]">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Yeniden dene
        </Button>
      ) : null}
    </div>
  );
}
