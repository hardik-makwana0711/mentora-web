import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';

export function Drawer({  open,
  title,
  children,
  footer,
  onClose,
  side = 'right',
  panelClassName,
}: {
  open: boolean;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  side?: 'left' | 'right';
  panelClassName?: string;
}) {
  const tr = useStrings();
  useEffect(() => {    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label={tr.closeAria} onClick={onClose} />
      <div
        className={cn(
          'relative ml-auto flex h-full w-[min(100%,400px)] flex-col border-l border-[var(--color-m-card-border)] bg-[var(--color-m-sidebar-bg)] shadow-xl',
          side === 'left' && 'ml-0 mr-auto border-l-0 border-r',
          panelClassName
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-m-card-border)] px-4 py-3">
          <span className="text-base font-semibold text-[var(--color-m-text)]">{title}</span>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]"
            onClick={onClose}
            aria-label={tr.closeAria}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="app-scroll-area flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-[var(--color-m-card-border)] px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
