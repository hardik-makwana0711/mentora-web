import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { cn } from '@/lib/utils';

export type StudentFilterOption = {
  student_id: string;
  student_name: string;
  grade_level?: string | null;
};

type Props = {
  value: string;
  onChange: (studentId: string) => void;
  students: StudentFilterOption[];
  className?: string;
  /** When false, hides the "All students" option (a specific student must stay selected). */
  allowAll?: boolean;
};

export function StudentFilterSelect({
  value,
  onChange,
  students,
  className,
  allowAll = true,
}: Props) {
  const tr = useStrings();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, width: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;

  const selected = students.find((s) => s.student_id === value);
  const display = selected
    ? selected.student_name
    : allowAll
      ? tr.lessonsAllStudents
      : (students[0]?.student_name ?? tr.lessonsStudentLabel);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        (s.grade_level ?? '').toLowerCase().includes(q)
    );
  }, [students, query]);

  const options = useMemo(
    () =>
      allowAll
        ? [{ student_id: '', student_name: tr.lessonsAllStudents, grade_level: null }, ...filtered]
        : filtered,
    [filtered, tr.lessonsAllStudents, allowAll]
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const updatePanelPosition = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelStyle({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 240) });
  }, []);

  useEffect(() => {
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
      if (rootRef.current?.contains(t) || listRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      setHighlight(0);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const pick = (id: string) => {
    onChange(id);
    close();
    btnRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      btnRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, options.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) pick(opt.student_id);
    }
  };

  const showSearch = students.length >= 5;

  /** Mobile-friendly native select */
  const native = (
    <label className={cn('block w-full sm:hidden', className)}>
      <span className="mb-1.5 block text-xs font-medium text-[var(--color-m-text-muted)]">
        {tr.lessonsStudentLabel}
      </span>
      <select
        className="h-11 w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] px-3 text-sm text-[var(--color-m-text)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {allowAll ? <option value="">{tr.lessonsAllStudents}</option> : null}
        {students.map((s) => (
          <option key={s.student_id} value={s.student_id}>
            {s.grade_level
              ? `${s.student_name} — ${i18n.t('studentsGradeShort', { grade: s.grade_level })}`
              : s.student_name}
          </option>
        ))}
      </select>
    </label>
  );

  const panel =
    open && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          className="fixed z-[9999] overflow-hidden rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-elevated)] shadow-lg ring-1 ring-black/20"
          style={{ top: panelStyle.top, left: panelStyle.left, width: panelStyle.width }}
          onKeyDown={onKeyDown}
        >
          {showSearch ? (
            <div className="flex items-center gap-2 border-b border-[var(--color-m-card-border)] px-3 py-2">
              <Search className="size-4 text-[var(--color-m-text-muted)]" aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                placeholder={tr.lessonsSearchStudents}
                className="w-full bg-transparent text-sm text-[var(--color-m-text)] outline-none placeholder:text-[var(--color-m-text-muted)]"
              />
            </div>
          ) : null}
          <ul className="max-h-[min(280px,50vh)] overflow-auto py-1">
            {options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--color-m-text-muted)]">{tr.empty}</li>
            ) : (
              options.map((opt, idx) => {
                const isSelected = opt.student_id === value;
                const isActive = idx === highlight;
                return (
                  <li key={opt.student_id || 'all'} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors',
                        isActive && 'bg-[var(--color-m-primary)]/15',
                        isSelected && 'font-medium'
                      )}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => pick(opt.student_id)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-[var(--color-m-text)]">
                          {opt.student_name}
                        </span>
                        {opt.grade_level ? (
                          <span className="mt-0.5 block text-xs text-[var(--color-m-text-muted)]">
                            {i18n.t('studentsGradeShort', { grade: opt.grade_level })}
                          </span>
                        ) : null}
                      </span>
                      {isSelected ? (
                        <Check className="size-4 shrink-0 text-[var(--color-m-primary-light)]" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>,
        document.body
      )
    ) : null;

  return (
    <>
      {native}
      <div ref={rootRef} className={cn('relative hidden w-full sm:block', className)}>
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-m-text-muted)]">
          {tr.lessonsStudentLabel}
        </span>
        <button
          ref={btnRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            'flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-[var(--color-m-bg)] px-3 text-left text-sm transition-colors',
            open
              ? 'border-[var(--color-m-primary)] ring-1 ring-[var(--color-m-primary)]/20'
              : 'border-[var(--color-m-card-border)] hover:border-[var(--color-m-primary)]/30'
          )}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onKeyDown}
        >
          <span className="truncate text-[var(--color-m-text)]">{display}</span>
          <ChevronDown
            className={cn('size-4 shrink-0 text-[var(--color-m-text-muted)] transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
        {panel}
      </div>
    </>
  );
}
