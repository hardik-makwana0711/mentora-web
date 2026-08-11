import { motion } from 'framer-motion';
import { AlertCircle, FileQuestion, MessageCircleOff } from 'lucide-react';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';

export function LandingProblem() {
  const { t } = useLandingLanguage();

  const problems = [
    {
      icon: AlertCircle,
      title: t('problem.card1.title'),
      description: t('problem.card1.desc'),
      iconColor: 'text-[var(--color-m-error)]',
      bar: 'from-[var(--color-m-error)]/60 to-[var(--color-m-accent-warm)]/40',
      bg: 'from-[var(--color-m-error)]/15 to-[var(--color-m-accent-warm)]/10',
    },
    {
      icon: MessageCircleOff,
      title: t('problem.card2.title'),
      description: t('problem.card2.desc'),
      iconColor: 'text-[var(--color-m-accent-warm)]',
      bar: 'from-[var(--color-m-accent-warm)]/60 to-[var(--color-m-primary)]/30',
      bg: 'from-[var(--color-m-accent-warm)]/15 to-[var(--color-m-primary)]/10',
    },
    {
      icon: FileQuestion,
      title: t('problem.card3.title'),
      description: t('problem.card3.desc'),
      iconColor: 'text-[var(--color-m-accent)]',
      bar: 'from-[var(--color-m-accent)]/60 to-[var(--color-m-error)]/30',
      bg: 'from-[var(--color-m-accent)]/15 to-[var(--color-m-error)]/10',
    },
  ];

  return (
    <section className={`${landing.section} relative overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-m-surface)]/60 via-[var(--color-m-bg)] to-[var(--color-m-bg)]" />

      <div className={landing.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className={`${landing.sectionTitle} mx-auto max-w-3xl text-balance`}>{t('problem.title')}</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <div className={`${landing.card} ${landing.cardHover} group relative h-full overflow-hidden`}>
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${problem.bar} opacity-0 transition-opacity group-hover:opacity-100`}
                />
                <div className="p-6 sm:p-8">
                  <div
                    className={`mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${problem.bg}`}
                  >
                    <problem.icon className={`size-7 ${problem.iconColor}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[var(--color-m-text)] transition-colors group-hover:text-[var(--color-m-primary-light)]">
                    {problem.title}
                  </h3>
                  <p className="leading-relaxed text-[var(--color-m-text-secondary)]">{problem.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
