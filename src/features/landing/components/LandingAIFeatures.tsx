import { motion } from 'framer-motion';
import { BarChart2, FileText, HelpCircle, Sparkles, Target } from 'lucide-react';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';

export function LandingAIFeatures() {
  const { t } = useLandingLanguage();

  const features = [
    { icon: FileText, title: t('ai.feature1.title'), description: t('ai.feature1.desc') },
    { icon: BarChart2, title: t('ai.feature2.title'), description: t('ai.feature2.desc') },
    { icon: HelpCircle, title: t('ai.feature3.title'), description: t('ai.feature3.desc') },
    { icon: Target, title: t('ai.feature4.title'), description: t('ai.feature4.desc') },
  ];

  return (
    <section id="yapay-zeka" className={`${landing.section} relative scroll-mt-24 overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-m-primary)]/5 via-[var(--color-m-bg)] to-[var(--color-m-accent)]/5" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="pointer-events-none absolute left-1/4 top-20 -z-10 size-96 rounded-full bg-[var(--color-m-primary)]/20 blur-3xl"
      />

      <div className={landing.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className={`${landing.badge} mb-6`}>
            <Sparkles className="size-4" />
            {t('ai.badge')}
          </div>
          <h2 className={`${landing.sectionTitle} mb-4 text-balance`}>{t('ai.title')}</h2>
          <p className={`${landing.sectionSubtitle} mx-auto max-w-3xl text-pretty`}>{t('ai.subtitle')}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`${landing.card} ${landing.cardHover} group relative h-full overflow-hidden`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-m-primary)] to-[var(--color-m-secondary)] opacity-50 transition-opacity group-hover:opacity-100" />
                <div className="p-6">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: -4 }}
                    className={`${landing.iconBox} mb-4 size-16`}
                  >
                    <feature.icon className="size-8" />
                  </motion.div>
                  <h3 className="mb-2 text-lg font-bold text-[var(--color-m-text)] transition-colors group-hover:text-[var(--color-m-primary-light)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
