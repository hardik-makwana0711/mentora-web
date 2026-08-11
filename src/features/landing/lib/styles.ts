/** Shared class tokens — Mentora dark theme mapped to reference landing layout */
export const landing = {
  page: 'min-h-dvh bg-[var(--color-m-bg)] text-[var(--color-m-text)]',
  section: 'py-20 md:py-28',
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  card:
    'rounded-[var(--radius-m-xxl)] border border-[var(--color-m-card-border)] bg-[var(--color-m-surface)]/90 shadow-[var(--shadow-m-card)] backdrop-blur-sm',
  cardHover:
    'transition-all duration-300 hover:border-[var(--color-m-primary)]/30 hover:shadow-[var(--shadow-m-glow)]',
  gradientText: 'landing-gradient-text',
  badge:
    'inline-flex items-center gap-2 rounded-full border border-[var(--color-m-primary)]/25 bg-[var(--color-m-primary)]/10 px-4 py-2 text-sm font-medium text-[var(--color-m-primary-light)]',
  iconBox:
    'flex items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-m-primary)] to-[var(--color-m-gradient-end)] text-white shadow-[var(--shadow-m-glow)]',
  sectionTitle: 'text-3xl font-bold text-[var(--color-m-text)] md:text-4xl lg:text-5xl',
  sectionSubtitle: 'text-lg text-[var(--color-m-text-secondary)]',
  muted: 'text-[var(--color-m-text-secondary)]',
} as const;
