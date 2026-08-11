import { createContext, useContext, useState, type ReactNode } from 'react';
import { tabTriggerClass } from '@/lib/button-styles';
import { cn } from '@/lib/utils';

type TabCtx = { value: string; setValue: (v: string) => void };

const Ctx = createContext<TabCtx | null>(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? 'upcoming');
  const value = controlledValue ?? uncontrolled;
  const setValue = (next: string) => {
    onValueChange?.(next);
    if (controlledValue === undefined) setUncontrolled(next);
  };
  return <Ctx.Provider value={{ value, setValue }}>{children}</Ctx.Provider>;
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 rounded-full bg-[var(--color-m-surface-light)] p-1 ring-1 ring-[var(--color-m-card-border)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabTrigger({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('TabTrigger outside Tabs');
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={tabTriggerClass(active)}
      onClick={() => ctx.setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('TabPanel outside Tabs');
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className="mt-4">
      {children}
    </div>
  );
}
