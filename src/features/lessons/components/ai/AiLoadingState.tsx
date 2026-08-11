import { Spinner } from '@/components/ui/Spinner';

export function AiLoadingState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Spinner className="size-5 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
    </div>
  );
}
