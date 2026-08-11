import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  empty: ReactNode;
}) {
  if (!rows.length) return <>{empty}</>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-surface-border)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-[var(--color-surface-card)] text-[var(--color-text-muted)]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 font-medium ${c.className ?? ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[var(--color-surface-border)] hover:bg-[var(--color-m-hover-overlay)]">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 text-[var(--color-text-secondary)] ${c.className ?? ''}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
