import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { educationService } from '@/services/education.service';
import { useDebouncedValue } from '@/features/education/hooks/useDebouncedValue';
import type { UniversitySummary } from '@/types/education';
import { cn } from '@/lib/utils';

type UniversityAutocompleteProps = {
  label?: string;
  value: UniversitySummary | null;
  onChange: (university: UniversitySummary | null) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
};

export function UniversityAutocomplete({
  label,
  value,
  onChange,
  error,
  disabled,
  className,
  variant = 'default',
}: UniversityAutocompleteProps) {
  const tr = useStrings();
  const resolvedLabel = label ?? tr.university;
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState(value?.name ?? '');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, width: 0 });
  const debouncedQ = useDebouncedValue(query.trim(), 400);

  useEffect(() => {
    if (value?.name) setQuery(value.name);
  }, [value?.id, value?.name]);

  const searchQuery = useQuery({
    queryKey: qk.educationUniversities(debouncedQ),
    queryFn: () => educationService.searchUniversities({ q: debouncedQ || undefined, limit: 20 }),
    enabled: open && debouncedQ.length >= 1,
    staleTime: 30_000,
  });

  const updatePanelPosition = useCallback(() => {
    const el = variant === 'compact' ? rootRef.current : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelStyle({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [variant]);

  useLayoutEffect(() => {
    if (!open || variant !== 'compact') return;
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePanelPosition, variant]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const items = searchQuery.data?.items ?? [];
  const showDropdown = open && debouncedQ.length >= 1;
  const hasSelection = Boolean(value);

  function selectUniversity(u: UniversitySummary) {
    onChange(u);
    setQuery(u.name);
    setOpen(false);
    inputRef.current?.blur();
  }

  function clearSelection() {
    onChange(null);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function renderDropdown(absolute = false) {
    if (!showDropdown) return null;

    const list = (
      <ul
        ref={variant === 'compact' ? listRef : undefined}
        id={listId}
        role="listbox"
        className={cn(
          'z-[9999] max-h-60 overflow-auto rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-elevated)] py-1 shadow-lg ring-1 ring-black/20',
          absolute ? 'absolute mt-1 w-full' : 'fixed'
        )}
        style={absolute ? undefined : { top: panelStyle.top, left: panelStyle.left, width: Math.max(panelStyle.width, 200) }}
      >
        {searchQuery.isError ? (
          <li className="px-4 py-3 text-sm text-[var(--color-m-error)]">
            {tr.universitySearchError}{' '}
            <Button type="button" variant="secondary" size="sm" className="ml-2" onClick={() => void searchQuery.refetch()}>
              {tr.retry}
            </Button>
          </li>
        ) : searchQuery.isLoading ? (
          <li className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-m-text-muted)]">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {tr.loading}
          </li>
        ) : items.length === 0 ? (
          <li className="px-4 py-3 text-sm text-[var(--color-m-text-muted)]">{tr.universitySearchEmpty}</li>
        ) : (
          items.map((u) => (
            <li key={u.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value?.id === u.id}
                className={cn(
                  'flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-[var(--color-m-primary)]/15',
                  value?.id === u.id && 'bg-[var(--color-m-primary)]/25'
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectUniversity(u)}
              >
                <Building2 className="mt-0.5 size-4 shrink-0 text-[var(--color-m-text-muted)]" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[var(--color-m-text)]">{u.name}</span>
                  {u.city ? (
                    <span className="block truncate text-xs text-[var(--color-m-text-muted)]">{u.city}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    );

    if (variant === 'compact' && typeof document !== 'undefined') {
      return createPortal(list, document.body);
    }

    return list;
  }

  if (variant === 'compact') {
    return (
      <div ref={rootRef} className={cn('relative w-full', className)}>
        <div
          className={cn(
            'flex h-11 items-center gap-2 rounded-xl border px-3 transition-colors',
            error
              ? 'border-[var(--color-m-error)]'
              : focused || open
                ? 'border-[var(--color-m-primary)] bg-[var(--color-m-surface-elevated)] ring-1 ring-[var(--color-m-primary)]/20'
                : 'border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] hover:border-[var(--color-m-primary)]/30',
            disabled && 'cursor-not-allowed opacity-70'
          )}
        >
          <Search className="size-4 shrink-0 text-[var(--color-m-text-muted)]" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            disabled={disabled}
            placeholder={tr.universitySearchPlaceholder}
            aria-label={tr.filterUniversity}
            aria-expanded={showDropdown}
            aria-controls={listId}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-m-text-muted)]',
              hasSelection ? 'font-medium text-[var(--color-m-text)]' : 'text-[var(--color-m-text)]'
            )}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (value && e.target.value !== value.name) onChange(null);
            }}
            onFocus={() => {
              setFocused(true);
              setOpen(true);
            }}
            onBlur={() => setFocused(false)}
          />
          {searchQuery.isFetching ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-[var(--color-m-text-muted)]" aria-hidden />
          ) : query ? (
            <button
              type="button"
              aria-label={tr.clearSelection}
              disabled={disabled}
              onClick={clearSelection}
              className="rounded-md p-0.5 text-[var(--color-m-text-muted)] transition hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        {error ? <p className="mt-1 text-[11px] text-[var(--color-m-error)]">{error}</p> : null}
        {renderDropdown()}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn('relative mb-4 w-full', className)}>
      <div className="relative">
        <Input
          label={resolvedLabel}
          value={query}
          error={error}
          disabled={disabled}
          placeholder={tr.universitySearchPlaceholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value && e.target.value !== value.name) onChange(null);
          }}
          onFocus={() => setOpen(true)}
        />
        <div className="pointer-events-none absolute right-3 top-[38px] flex items-center gap-1 text-[var(--color-m-text-muted)]">
          {searchQuery.isFetching ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Search className="size-4" aria-hidden />}
        </div>
      </div>

      {value ? (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-m-text)]">{value.name}</p>
            {value.city ? (
              <p className="truncate text-xs text-[var(--color-m-text-muted)]">{value.city}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={tr.clearSelection}
            disabled={disabled}
            onClick={clearSelection}
            className="rounded-lg p-1 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {renderDropdown(true)}
    </div>
  );
}
