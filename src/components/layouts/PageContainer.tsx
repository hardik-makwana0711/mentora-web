import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Page width — default `full` uses the main column (mockup-style, no narrow column). */
const widthClass = {
  full: 'w-full max-w-none',
  content: 'mx-auto w-full max-w-6xl',
  form: 'mx-auto w-full max-w-2xl',
} as const;

export type PageWidth = keyof typeof widthClass;

export function PageContainer({
  children,
  width = 'full',
  className,
}: {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
}) {
  return <div className={cn(widthClass[width], className)}>{children}</div>;
}
