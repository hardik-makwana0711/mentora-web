import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DropdownOption = { value: string; label: string };

type DropdownSelectProps = {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
  labelVariant?: 'default' | 'compact';
  /** Passed through for forms / testing */
  name?: string;
};

export function DropdownSelect({
  label,
  error,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  disabled = false,
  emptyMessage,
  className,
  labelVariant = 'default',
  name,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, width: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const labelId = `${uid}-label`;
  const listId = `${uid}-list`;
  const buttonId = `${uid}-btn`;

  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);

  const updatePanelPosition = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelStyle({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        btnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? (value || placeholder || '');

  const list = open && !disabled ? (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      className="fixed z-[9999] max-h-[min(280px,50vh)] overflow-auto rounded-[12px] border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-elevated)] py-1 shadow-lg ring-1 ring-black/20"
      style={{ top: panelStyle.top, left: panelStyle.left, width: Math.max(panelStyle.width, 160) }}
    >
      {options.length === 0 ? (
        <li role="presentation" className="px-4 py-3 text-[14px] text-[var(--color-m-text-muted)]">
          {emptyMessage ?? placeholder ?? '—'}
        </li>
      ) : (
        options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={cn(
                  'flex w-full cursor-pointer items-center px-4 py-3 text-left text-[15px] text-[var(--color-m-text)] transition-colors hover:bg-[var(--color-m-primary)]/15',
                  isSelected && 'bg-[var(--color-m-primary)]/25 font-medium text-[var(--color-m-text)]'
                )}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  onBlur?.();
                  btnRef.current?.focus();
                }}
              >
                {opt.label}
              </button>
            </li>
          );
        })
      )}
    </ul>
  ) : null;

  return (
    <div ref={rootRef} className={cn('relative mb-4 w-full', className)}>
      {label ? (
        <label
          id={labelId}
          htmlFor={buttonId}
          className={cn(
            'mb-2 block cursor-pointer',
            labelVariant === 'compact'
              ? 'text-xs font-medium normal-case tracking-normal text-[var(--color-m-text-muted)]'
              : 'text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]'
          )}
        >
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'flex min-h-[44px] flex-row items-center overflow-visible rounded-xl border bg-[var(--color-m-bg)] transition-colors',
          error ? 'border-[var(--color-m-error)]' : 'border-[var(--color-m-card-border)]',
          open && !disabled && 'border-[var(--color-m-primary)] bg-[var(--color-m-surface-elevated)] ring-1 ring-[var(--color-m-primary)]/20',
          !open && !disabled && 'hover:border-[var(--color-m-primary)]/30',
          disabled && 'cursor-not-allowed bg-[var(--color-m-surface-light)]/50'
        )}
      >
        <button
          ref={btnRef}
          type="button"
          name={name}
          id={buttonId}
          disabled={disabled}
          aria-labelledby={label ? labelId : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            'flex min-h-[44px] w-full flex-1 items-center justify-between gap-2 border-0 bg-transparent px-4 text-left text-[15px] outline-none',
            disabled ? 'cursor-not-allowed text-[var(--color-m-text-muted)]' : 'cursor-pointer',
            !selected && placeholder ? 'text-[var(--color-m-text-muted)]' : 'text-[var(--color-m-text)]'
          )}
          onClick={() => {
            if (disabled) return;
            setOpen((was) => {
              if (was) onBlur?.();
              return !was;
            });
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen((was) => {
                if (was) onBlur?.();
                return !was;
              });
            }
          }}
        >
          <span className="truncate">{display}</span>
          <ChevronDown
            className={cn('size-5 shrink-0 text-[var(--color-m-text-muted)] transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>

      {typeof document !== 'undefined' && list ? createPortal(list, document.body) : null}

      {error ? <p className="mt-1 pl-1 text-[11px] text-[var(--color-m-error)]">{error}</p> : null}
    </div>
  );
}
