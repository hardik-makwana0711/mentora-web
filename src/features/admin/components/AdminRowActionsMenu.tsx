import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AdminRowMenuItem =
  | { type: 'link'; to: string; label: string; icon?: LucideIcon }
  | {
      type: 'button';
      label: string;
      icon?: LucideIcon;
      onClick: () => void;
      destructive?: boolean;
      disabled?: boolean;
    }
  | { type: 'divider' };

const triggerClass =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-[var(--color-m-text-muted)] transition-colors hover:border-[var(--color-m-card-border)] hover:bg-[var(--color-m-surface-light)] hover:text-[var(--color-m-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-m-primary)]';

const itemClass =
  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[var(--color-m-text)] transition-colors hover:bg-[var(--color-m-hover-overlay)]';

function normalizeMenuItems(items: AdminRowMenuItem[]): AdminRowMenuItem[] {
  const result: AdminRowMenuItem[] = [];
  for (const item of items) {
    if (item.type === 'divider') {
      if (!result.length || result[result.length - 1]?.type === 'divider') continue;
      result.push(item);
    } else {
      result.push(item);
    }
  }
  if (result[result.length - 1]?.type === 'divider') result.pop();
  return result;
}

export function AdminIconAction({
  to,
  onClick,
  icon: Icon,
  label,
  disabled,
}: {
  to?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
}) {
  const className = cn(
    triggerClass,
    disabled && 'pointer-events-none opacity-40'
  );

  if (to) {
    return (
      <Link to={to} className={className} title={label} aria-label={label}>
        <Icon className="size-4" aria-hidden />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

export function AdminRowActionsMenu({
  items,
  triggerLabel,
  align = 'end',
}: {
  items: AdminRowMenuItem[];
  triggerLabel: string;
  align?: 'start' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, minWidth: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const updatePosition = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelWidth = panelRef.current?.offsetWidth ?? 200;
    const left =
      align === 'end'
        ? Math.max(8, rect.right - panelWidth)
        : Math.min(rect.left, window.innerWidth - panelWidth - 8);
    setPanelStyle({
      top: rect.bottom + 6,
      left,
      minWidth: Math.max(rect.width, 200),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, align]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onScroll = () => setOpen(false);

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const visibleItems = normalizeMenuItems(items);

  if (!visibleItems.length) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={triggerClass}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={menuId}
              role="menu"
              className="fixed z-[120] overflow-hidden rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-elevated)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
              style={{ top: panelStyle.top, left: panelStyle.left, minWidth: panelStyle.minWidth }}
            >
              {visibleItems.map((item, idx) => {
                if (item.type === 'divider') {
                  return <div key={`d-${idx}`} className="my-1 h-px bg-[var(--color-m-card-border)]" role="separator" />;
                }

                const Icon = item.icon;
                const content: ReactNode = (
                  <>
                    {Icon ? <Icon className="size-4 shrink-0 opacity-70" aria-hidden /> : null}
                    <span>{item.label}</span>
                  </>
                );

                if (item.type === 'link') {
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      role="menuitem"
                      className={itemClass}
                      onClick={() => setOpen(false)}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    className={cn(
                      itemClass,
                      item.destructive && 'text-[var(--color-m-error)] hover:bg-[var(--color-m-error)]/10',
                      item.disabled && 'cursor-not-allowed opacity-50'
                    )}
                    onClick={() => {
                      if (item.disabled) return;
                      setOpen(false);
                      item.onClick();
                    }}
                  >
                    {content}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
