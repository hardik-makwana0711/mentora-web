import { useEffect, useState, type RefObject } from 'react';

export function useScrollSpy(
  sectionRefs: { id: string; ref: RefObject<HTMLElement | null> }[]
): string | null {
  const [activeId, setActiveId] = useState<string | null>(sectionRefs[0]?.id ?? null);
  const idsKey = sectionRefs.map((s) => s.id).join(',');

  useEffect(() => {
    const elements = sectionRefs
      .map(({ id, ref }) => (ref.current ? { id, el: ref.current } : null))
      .filter((x): x is { id: string; el: HTMLElement } => x !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        const match = elements.find((e) => e.el === topMost.target);
        if (match) setActiveId(match.id);
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 }
    );

    elements.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return activeId;
}

export function scrollToSection(ref: RefObject<HTMLElement | null>) {
  ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
