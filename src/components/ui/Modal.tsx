import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  const tr = useStrings();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={tr.closeAria}
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-elevated)] shadow-xl sm:rounded-2xl'
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-surface-border)] px-4 py-3">
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{title}</h2>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]"
            onClick={onClose}
            aria-label={tr.closeAria}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4">{children}</div>
        {footer ? <div className="border-t border-[var(--color-surface-border)] px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}
