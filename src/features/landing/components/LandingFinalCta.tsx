import { motion } from 'framer-motion';
import { Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';

type LandingFinalCtaProps = {
  onStartLearning: () => void;
  onApplyMentor: () => void;
};

export function LandingFinalCta({ onStartLearning, onApplyMentor }: LandingFinalCtaProps) {
  const { t } = useLandingLanguage();

  return (
    <section id="hemen-basla" className={`${landing.section} relative scroll-mt-24 overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-m-surface)]/40 via-[var(--color-m-primary)]/5 to-[var(--color-m-bg)]" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[var(--color-m-primary)]/20 to-[var(--color-m-accent)]/15 blur-3xl"
      />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 8 }}
            className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--color-m-primary)] via-[var(--color-m-secondary)] to-[var(--color-m-accent)] shadow-[var(--shadow-m-glow)]"
          >
            <Rocket className="size-10 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold leading-tight text-balance text-[var(--color-m-text)] md:text-4xl lg:text-5xl">
            {t('finalCta.title')}
          </h2>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="!rounded-[18px] px-8" onClick={onStartLearning}>
              {t('finalCta.startLearning')}
            </Button>
            <Button size="lg" variant="secondary" className="!rounded-[18px] border-2 px-8" onClick={onApplyMentor}>
              {t('finalCta.applyMentor')}
            </Button>
          </div>

          <span className={`${landing.badge} text-sm`}>
            <Sparkles className="size-3.5" />
            {t('finalCta.earlyAccess')}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
