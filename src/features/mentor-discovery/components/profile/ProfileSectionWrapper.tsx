import type { ReactNode, RefObject } from 'react';

export function ProfileSectionWrapper({
  id,
  heading,
  sectionRef,
  actions,
  children,
}: {
  id: string;
  heading: string;
  sectionRef?: RefObject<HTMLElement | null>;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      ref={sectionRef}
      className="scroll-mt-28 rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5 shadow-[var(--shadow-m-card)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{heading}</h2>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
