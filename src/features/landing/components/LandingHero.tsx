import { motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';

type LandingHeroProps = {
  onStartLearning: () => void;
  onApplyMentor: () => void;
};

export function LandingHero({ onStartLearning, onApplyMentor }: LandingHeroProps) {
  const { t } = useLandingLanguage();
  const titleWords = t('hero.title').split(' ');

  const trustBadges = [
    { icon: ShieldCheck, label: t('hero.trustBadge1') },
    { icon: Users, label: t('hero.trustBadge2') },
    { icon: Brain, label: t('hero.trustBadge3') },
    { icon: Video, label: t('hero.trustBadge4') },
  ];

  const lessonItems = [
    { icon: BookOpen, text: t('hero.summaryReady') },
    { icon: Brain, text: t('hero.miniQuiz') },
    { icon: TrendingUp, text: t('hero.performance') },
  ];

  return (
    <section
      id="giris"
      aria-label={t('hero.sectionLabel')}
      className="relative scroll-mt-24 overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--color-m-auth-gradient)]" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -right-20 top-20 size-96 rounded-full bg-[var(--color-m-primary)]/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -left-20 bottom-20 size-80 rounded-full bg-[var(--color-m-accent)]/15 blur-3xl"
        />
      </div>

      <div className={landing.container}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <span className={landing.badge}>
                  <Sparkles className="size-3.5" />
                  {t('hero.badge')}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl"
              >
                <span className="text-[var(--color-m-text)]">{titleWords.slice(0, 2).join(' ')} </span>
                <span className={landing.gradientText}>{titleWords.slice(2).join(' ')}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-xl text-lg leading-relaxed text-[var(--color-m-text-secondary)]"
              >
                {t('hero.description')}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button size="lg" className="!rounded-[18px] group" onClick={onStartLearning}>
                <Play className="mr-2 size-4 transition-transform group-hover:scale-110" />
                {t('hero.startLearning')}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="!rounded-[18px] border-2"
                onClick={onApplyMentor}
              >
                {t('hero.applyMentor')}
              </Button>
            </motion.div>
          </motion.div>

          {/* UI preview card — matches reference demo middle section */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className={`${landing.card} relative overflow-hidden`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-m-primary)] via-[var(--color-m-secondary)] to-[var(--color-m-accent)]" />
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-m-text-muted)]">{t('hero.todayLesson')}</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-m-secondary)] to-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      <span className="size-2 animate-ping rounded-full bg-white" />
                      {t('hero.live')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-[var(--color-m-text)]">{t('hero.math')}</h3>
                    <p className="text-sm text-[var(--color-m-text-muted)]">{t('hero.grade7')}</p>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 pt-2">
                    <div className="landing-mentor-avatar" aria-hidden>
                      <User strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-m-text)]">
                        {t('hero.mentorLabel')}
                      </p>
                      <p className="truncate text-xs text-[var(--color-m-text-muted)]">
                        {t('hero.mentorUni')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-[var(--color-m-card-border)] pt-4">
                    {lessonItems.map((item, index) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-m-primary)] to-[var(--color-m-gradient-end)] shadow-md">
                          <item.icon className="size-4 text-white" />
                        </div>
                        <span className="font-medium text-[var(--color-m-text-secondary)]">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="absolute -right-6 -top-6 size-24 animate-pulse rounded-full bg-[var(--color-m-primary)]/25 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 size-32 animate-pulse rounded-full bg-[var(--color-m-accent)]/20 blur-2xl" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 border-t border-[var(--color-m-card-border)]/50 pt-10"
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`${landing.card} ${landing.cardHover} flex items-center gap-3 p-4`}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-m-primary)]/15">
                  <badge.icon className="size-6 text-[var(--color-m-primary-light)]" />
                </div>
                <span className="text-sm font-medium text-[var(--color-m-text)]">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
