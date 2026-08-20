import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { BrandMark } from '@/components/layouts/AppLogo';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { useStrings } from '@/constants/strings';
import { landing } from '@/features/landing/lib/styles';

export function LandingFooter() {
  const { t } = useLandingLanguage();
  const tr = useStrings();

  const footerLinks = [
    { href: '#gizlilik', label: t('footer.privacy'), id: 'gizlilik' },
    { href: '#kullanim', label: t('footer.terms'), id: 'kullanim' },
    { href: '#mentor-basvuru', label: t('footer.mentorApply') },
    { href: '#iletisim', label: t('footer.contact'), id: 'iletisim' },
  ];

  return (
    <footer className="border-t border-[var(--color-m-card-border)] bg-gradient-to-b from-[var(--color-m-surface)] to-[var(--color-m-bg)]">
      <div className={`${landing.container} py-16`}>
        <div className="grid gap-10 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <Link
              to="/"
              className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
              aria-label={t('nav.brandAria')}
            >
              <BrandMark size="lg" />
              <span className="truncate text-xl font-bold text-[var(--color-m-text)] transition-colors group-hover:text-[var(--color-m-primary-light)] sm:text-2xl">
                {tr.appName}
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
              {t('footer.description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end"
          >
            {footerLinks.map((link) => (
              <a
                key={link.href}
                id={'id' in link ? link.id : undefined}
                href={link.href}
                className="group relative text-sm text-[var(--color-m-text-secondary)] transition-colors hover:text-[var(--color-m-primary-light)]"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-[var(--color-m-primary)] to-[var(--color-m-secondary)] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-m-card-border)] pt-8 sm:flex-row"
        >
          <p className="text-sm text-[var(--color-m-text-muted)]">
            &copy; {new Date().getFullYear()} {tr.appName}. {t('footer.rights')}
          </p>
          <p className="flex items-center gap-1 text-sm text-[var(--color-m-text-muted)]">
            {t('footer.madeIn')} <Heart className="size-4 fill-[var(--color-m-error)] text-[var(--color-m-error)]" />
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
