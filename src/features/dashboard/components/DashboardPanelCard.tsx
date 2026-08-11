import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dashboardCardVariants, dashboardGridVariants } from '@/features/dashboard/lib/dashboard-motion';

export function DashboardGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      variants={dashboardGridVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

type DashboardPanelCardProps = Omit<HTMLMotionProps<'div'>, 'children'> & { children: ReactNode };

export function DashboardPanelCard({ className, children, ...rest }: DashboardPanelCardProps) {
  return (
    <motion.div
      variants={dashboardCardVariants}
      className={cn(
        'h-full rounded-[16px] border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5',
        'shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]',
        'transition-[transform,box-shadow] duration-200 will-change-transform',
        'hover:-translate-y-0.5 hover:shadow-[var(--shadow-m-glow)]',
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
