import { motion } from 'framer-motion';
import { CheckCircle2, FileCheck, Lock, ShieldCheck, Star, UserCheck } from 'lucide-react';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';
import { cn } from '@/lib/utils';

const ORBIT_ITEMS = [
  { icon: ShieldCheck, angle: -90, labelKey: 'trust.item1' as const },
  { icon: FileCheck, angle: 0, labelKey: 'trust.item2' as const },
  { icon: UserCheck, angle: 90, labelKey: 'trust.item3' as const },
  { icon: Star, angle: 180, labelKey: 'trust.item4' as const },
] as const;

const RADIUS = 118;

function TrustSecurityVisual() {
  const { t } = useLandingLanguage();

  return (
    <div
      className={cn(
        landing.card,
        'relative overflow-hidden p-6 sm:p-8 lg:p-10'
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-m-primary)] via-[var(--color-m-secondary)] to-[var(--color-m-accent)]" />
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[var(--color-m-primary)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-[var(--color-m-secondary)]/10 blur-3xl" />

      <p className="relative mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-m-primary-light)]">
        {t('trust.kvkkDesc')}
      </p>

      <div className="relative mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center sm:max-w-[360px]">
        {/* Static orbit ring */}
        <div
          className="absolute inset-[12%] rounded-full border border-dashed border-[var(--color-m-primary)]/25"
          aria-hidden
        />
        <div
          className="absolute inset-[22%] rounded-full bg-[var(--color-m-primary)]/5"
          aria-hidden
        />

        {/* Connector lines */}
        <svg
          className="absolute inset-0 size-full text-[var(--color-m-primary)]/20"
          viewBox="0 0 320 320"
          aria-hidden
        >
          {ORBIT_ITEMS.map((item) => {
            const rad = (item.angle * Math.PI) / 180;
            const cx = 160 + Math.cos(rad) * RADIUS;
            const cy = 160 + Math.sin(rad) * RADIUS;
            return (
              <line
                key={item.labelKey}
                x1="160"
                y1="160"
                x2={cx}
                y2={cy}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
            );
          })}
        </svg>

        {/* Center hub — gentle pulse, no spin */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 0 0 rgba(108,92,231,0.35)', '0 0 0 18px rgba(108,92,231,0)', '0 0 0 0 rgba(108,92,231,0)'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
            className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-m-primary)] via-[var(--color-m-secondary)] to-[var(--color-m-accent)] shadow-[var(--shadow-m-glow)] sm:size-32"
          >
            <Lock className="size-12 text-[var(--color-m-text)] sm:size-14" strokeWidth={1.75} />
          </motion.div>
        </motion.div>

        {/* Satellite nodes — fixed positions */}
        {ORBIT_ITEMS.map((item, index) => {
          const rad = (item.angle * Math.PI) / 180;
          const x = 50 + (Math.cos(rad) * RADIUS) / 3.2;
          const y = 50 + (Math.sin(rad) * RADIUS) / 3.2;

          return (
            <motion.div
              key={item.labelKey}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + index * 0.1, duration: 0.4 }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="group flex w-[5.5rem] flex-col items-center gap-2 sm:w-24">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-elevated)] shadow-[var(--shadow-m-card)] transition group-hover:border-[var(--color-m-primary)]/40 group-hover:shadow-[var(--shadow-m-glow)] sm:size-14">
                  <item.icon className="size-5 text-[var(--color-m-primary-light)] sm:size-6" strokeWidth={1.75} />
                </div>
                <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-[var(--color-m-text-secondary)] sm:text-[11px]">
                  {t(item.labelKey)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Compliance footer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 }}
        className="relative mt-8 space-y-4"
      >
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-[var(--color-m-primary)]/25 bg-gradient-to-r from-[var(--color-m-primary)]/10 to-[var(--color-m-secondary)]/10 px-5 py-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-m-primary)]/20">
            <ShieldCheck className="size-6 text-[var(--color-m-primary-light)]" />
          </div>
          <div className="text-left">
            <p className="text-base font-bold text-[var(--color-m-text)]">{t('trust.kvkk')}</p>
            <p className="text-xs text-[var(--color-m-text-muted)]">{t('trust.kvkkDesc')}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {(['trust.badgeSsl', 'trust.badgeKvkk', 'trust.badgeVerified'] as const).map((key) => (
            <span
              key={key}
              className="rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-3 py-1 text-[11px] font-semibold tracking-wide text-[var(--color-m-text-secondary)]"
            >
              {t(key)}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function LandingTrust() {
  const { t } = useLandingLanguage();

  const trustItems = [
    { icon: ShieldCheck, label: t('trust.item1') },
    { icon: FileCheck, label: t('trust.item2') },
    { icon: UserCheck, label: t('trust.item3') },
    { icon: Star, label: t('trust.item4') },
  ];

  return (
    <section id="guven" className={`${landing.section} relative scroll-mt-24 overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-m-bg)] via-[var(--color-m-surface)]/15 to-[var(--color-m-bg)]" />

      <div className={landing.container}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className={landing.badge}>
                <ShieldCheck className="size-4" />
                {t('nav.trust')}
              </span>
              <h2 className={landing.sectionTitle}>{t('trust.title')}</h2>
              <p className="text-lg leading-relaxed text-[var(--color-m-text-secondary)]">
                {t('trust.description')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {trustItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    landing.card,
                    landing.cardHover,
                    'flex items-center gap-3 p-4'
                  )}
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-m-primary)]/20 to-[var(--color-m-secondary)]/15">
                    <item.icon className="size-5 text-[var(--color-m-primary-light)]" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-medium leading-snug text-[var(--color-m-text)]">{item.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-m-secondary)]/20 bg-[var(--color-m-secondary)]/5 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--color-m-secondary)]" />
              <p className="text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
                {t('trust.dataNote')}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <TrustSecurityVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
