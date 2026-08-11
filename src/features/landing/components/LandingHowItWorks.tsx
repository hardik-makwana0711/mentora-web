import { motion } from 'framer-motion';
import { BarChart3, ChevronRight, FileText, Search, UserCheck, Video } from 'lucide-react';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';
import { cn } from '@/lib/utils';

const STEP_THEMES = [
  {
    gradient: 'from-[var(--color-m-primary)] to-[var(--color-m-primary-light)]',
    glow: 'shadow-[var(--shadow-m-glow)]',
  },
  {
    gradient: 'from-[var(--color-m-secondary)] to-emerald-400',
    glow: 'shadow-[0_12px_32px_rgba(67,184,156,0.3)]',
  },
  {
    gradient: 'from-[var(--color-m-info)] to-[var(--color-m-secondary)]',
    glow: 'shadow-[0_12px_32px_rgba(76,201,240,0.25)]',
  },
  {
    gradient: 'from-[var(--color-m-accent-warm)] to-[var(--color-m-primary)]',
    glow: 'shadow-[0_12px_32px_rgba(255,209,102,0.2)]',
  },
  {
    gradient: 'from-[var(--color-m-accent)] to-[var(--color-m-gradient-end)]',
    glow: 'shadow-[0_12px_32px_rgba(255,101,132,0.25)]',
  },
] as const;

function StepConnector({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center text-[var(--color-m-text-muted)]/50',
        className
      )}
      aria-hidden
    >
      <ChevronRight className="size-5" />
    </div>
  );
}

function StepCard({
  step,
  theme,
  index,
}: {
  step: { icon: typeof UserCheck; number: string; title: string; description: string };
  theme: (typeof STEP_THEMES)[number];
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className={cn(
        landing.card,
        landing.cardHover,
        'relative flex h-full flex-col items-center p-5 text-center sm:p-6'
      )}
    >
      <span className="mb-4 inline-flex items-center rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-3 py-1 text-xs font-bold tracking-wide text-[var(--color-m-primary-light)]">
        {step.number}
      </span>

      <div
        className={cn(
          'mb-5 flex size-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br',
          theme.gradient,
          theme.glow
        )}
      >
        <step.icon className="size-8 text-[var(--color-m-text)]" strokeWidth={1.75} />
      </div>

      <h3 className="mb-2 min-h-[3.25rem] text-base font-semibold leading-snug text-[var(--color-m-text)] sm:text-[17px]">
        {step.title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--color-m-text-secondary)]">{step.description}</p>
    </motion.article>
  );
}

export function LandingHowItWorks() {
  const { t } = useLandingLanguage();

  const steps = [
    { icon: UserCheck, number: '01', title: t('how.step1.title'), description: t('how.step1.desc') },
    { icon: Search, number: '02', title: t('how.step2.title'), description: t('how.step2.desc') },
    { icon: Video, number: '03', title: t('how.step3.title'), description: t('how.step3.desc') },
    { icon: FileText, number: '04', title: t('how.step4.title'), description: t('how.step4.desc') },
    { icon: BarChart3, number: '05', title: t('how.step5.title'), description: t('how.step5.desc') },
  ];

  return (
    <section id="nasil-calisir" className={`${landing.section} relative scroll-mt-24 overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-m-bg)] via-[var(--color-m-surface)]/20 to-[var(--color-m-bg)]" />

      <div className={`${landing.container} relative`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className={`${landing.sectionTitle} mb-4`}>{t('how.title')}</h2>
          <p className={`${landing.sectionSubtitle} mx-auto max-w-2xl`}>{t('how.subtitle')}</p>
        </motion.div>

        {/* Desktop: horizontal cards with chevron connectors */}
        <div className="hidden items-stretch gap-2 xl:flex">
          {steps.map((step, index) => (
            <div key={step.number} className="flex min-w-0 flex-1 items-stretch">
              <StepCard step={step} theme={STEP_THEMES[index]} index={index} />
              {index < steps.length - 1 ? (
                <StepConnector className="mx-1 self-center pt-8" />
              ) : null}
            </div>
          ))}
        </div>

        {/* Tablet: responsive card grid */}
        <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:hidden">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} theme={STEP_THEMES[index]} index={index} />
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="flex flex-col gap-0 md:hidden">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
                    STEP_THEMES[index].gradient
                  )}
                >
                  <step.icon className="size-5 text-[var(--color-m-text)]" strokeWidth={1.75} />
                </div>
                {index < steps.length - 1 ? (
                  <div className="my-2 w-px flex-1 bg-gradient-to-b from-[var(--color-m-primary)]/40 to-transparent" />
                ) : null}
              </div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={cn(landing.card, 'mb-4 flex-1 p-4')}
              >
                <span className="mb-2 inline-block text-xs font-bold text-[var(--color-m-primary-light)]">
                  {step.number}
                </span>
                <h3 className="mb-1.5 text-base font-semibold text-[var(--color-m-text)]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
                  {step.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
