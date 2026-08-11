import { motion } from 'framer-motion';
import { BookOpen, Check, GraduationCap, Users } from 'lucide-react';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';

export function LandingValueByUser() {
  const { t } = useLandingLanguage();

  const userTypes = [
    {
      icon: BookOpen,
      title: t('value.students'),
      bar: 'from-blue-500 to-cyan-500',
      iconBox: 'from-blue-500 to-cyan-500',
      checkBg: 'from-blue-500/15 to-cyan-500/10',
      benefits: [t('value.students.1'), t('value.students.2'), t('value.students.3')],
    },
    {
      icon: Users,
      title: t('value.parents'),
      bar: 'from-[var(--color-m-primary)] to-[var(--color-m-secondary)]',
      iconBox: 'from-[var(--color-m-primary)] to-[var(--color-m-secondary)]',
      checkBg: 'from-[var(--color-m-primary)]/15 to-[var(--color-m-secondary)]/10',
      benefits: [t('value.parents.1'), t('value.parents.2'), t('value.parents.3')],
    },
    {
      icon: GraduationCap,
      title: t('value.mentors'),
      bar: 'from-[var(--color-m-accent-warm)] to-[var(--color-m-accent)]',
      iconBox: 'from-[var(--color-m-accent-warm)] to-[var(--color-m-accent)]',
      checkBg: 'from-[var(--color-m-accent-warm)]/15 to-[var(--color-m-accent)]/10',
      benefits: [t('value.mentors.1'), t('value.mentors.2'), t('value.mentors.3')],
    },
  ];

  return (
    <section className={`${landing.section} relative overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-m-surface)]/50 via-[var(--color-m-bg)] to-[var(--color-m-bg)]" />

      <div className={landing.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className={landing.sectionTitle}>{t('value.title')}</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {userTypes.map((user, index) => (
            <motion.div
              key={user.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <div className={`${landing.card} ${landing.cardHover} group relative h-full overflow-hidden`}>
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${user.bar}`} />
                <div className="p-6 sm:p-8">
                  <div className={`mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${user.iconBox} shadow-lg`}>
                    <user.icon className="size-8 text-[var(--color-m-text)]" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-[var(--color-m-text)] transition-colors group-hover:text-[var(--color-m-primary-light)]">
                    {user.title}
                  </h3>
                  <ul className="space-y-4">
                    {user.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${user.checkBg}`}
                        >
                          <Check className="size-3.5 text-[var(--color-m-primary-light)]" />
                        </div>
                        <span className="text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
