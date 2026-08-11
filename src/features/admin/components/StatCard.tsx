import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  to,
  loading,
}: {
  label: string;
  value: number | string;
  to?: string;
  loading?: boolean;
}) {
  const inner = (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-card)] p-4 transition',
        to && 'hover:border-[var(--color-brand-primary)]/40 hover:bg-[var(--color-m-hover-overlay)]'
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[color-mix(in_srgb,var(--color-m-text)_10%,transparent)]" />
      ) : (
        <p className="mt-1 text-2xl font-semibold text-[var(--color-m-text)]">{value}</p>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]">
        {inner}
      </Link>
    );
  }

  return inner;
}
