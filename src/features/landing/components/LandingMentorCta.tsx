import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';

type LandingMentorCtaProps = {
  onApplyMentor: () => void;
};

export function LandingMentorCta({ onApplyMentor }: LandingMentorCtaProps) {
  const { t } = useLandingLanguage();

  return (
    <section id="mentor-ol" className={`${landing.section} scroll-mt-24`}>
      <div className={landing.container}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-[var(--color-m-card-border)] bg-gradient-to-br from-[var(--color-m-surface-elevated)] via-[var(--color-m-surface)] to-[var(--color-m-bg)] p-8 md:p-12 lg:p-16"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute right-0 top-0 size-96 rounded-full bg-[var(--color-m-primary)]/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 left-0 size-80 rounded-full bg-[var(--color-m-accent)]/15 blur-3xl"
          />

          <Sparkles className="absolute right-20 top-10 size-8 text-[var(--color-m-primary)]/30" />
          <Sparkles className="absolute bottom-10 left-20 size-6 text-[var(--color-m-accent)]/30" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 8 }}
              className="mx-auto mb-8 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--color-m-primary)] to-[var(--color-m-gradient-end)] shadow-[var(--shadow-m-glow)]"
            >
              <GraduationCap className="size-10 text-white" />
            </motion.div>

            <h2 className="mb-6 text-3xl font-bold text-balance text-[var(--color-m-text)] md:text-4xl lg:text-5xl">
              {t('mentorCta.title')}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--color-m-text-secondary)] md:text-xl">
              {t('mentorCta.description')}
            </p>

            <motion.div id="mentor-basvuru" className="scroll-mt-24" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="!rounded-[18px] px-8 py-6 text-lg group" onClick={onApplyMentor}>
                {t('mentorCta.button')}
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
