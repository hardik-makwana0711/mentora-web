import { cn } from '@/lib/utils';
import type { MaterialType } from '@/services/materials.service';

type TabValue = 'all' | MaterialType;

export function MaterialTabs({
  value,
  onChange,
  labels,
}: {
  value: TabValue;
  onChange: (value: TabValue) => void;
  labels: { all: string; assignment: string; course_resource: string };
}) {
  const tabs: { value: TabValue; label: string }[] = [
    { value: 'all', label: labels.all },
    { value: 'assignment', label: labels.assignment },
    { value: 'course_resource', label: labels.course_resource },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
            value === tab.value
              ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 text-[var(--color-m-text)]'
              : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-muted)] hover:text-[var(--color-m-text)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
