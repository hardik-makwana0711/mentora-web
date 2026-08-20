import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AppChromeControls } from '@/components/ui/AppChromeControls';
import { BrandMark } from '@/components/layouts/AppLogo';
import { cn } from '@/lib/utils';
import { useLandingLanguage } from '@/features/landing/lib/landing-context';
import { useStrings } from '@/constants/strings';

type LandingNavbarProps = {
  onLogin: () => void;
  onRegister: () => void;
};

export function LandingNavbar({ onLogin, onRegister }: LandingNavbarProps) {
  const { t } = useLandingLanguage();
  const tr = useStrings();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setIsOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  const navLinks = [
    { href: '#nasil-calisir', label: t('nav.howItWorks') },
    { href: '#guven', label: t('nav.trust') },
    { href: '#yapay-zeka', label: t('nav.ai') },
    { href: '#mentor-ol', label: t('nav.becomeMentor') },
  ];

  const solidBar = scrolled || isOpen;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solidBar
          ? 'border-b border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] shadow-[var(--shadow-m-card)]'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-2 sm:gap-2.5"
          aria-label={t('nav.brandAria')}
        >
          <BrandMark size="md" />
          <span className="truncate text-lg font-bold text-[var(--color-m-text)] transition-colors group-hover:text-[var(--color-m-primary-light)] sm:text-xl">
            {tr.appName}
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-[var(--color-m-text-secondary)] transition-colors hover:text-[var(--color-m-primary-light)]"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-[var(--color-m-primary)] to-[var(--color-m-secondary)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <AppChromeControls />
          <Button variant="ghost" size="sm" onClick={onLogin}>
            {t('nav.login')}
          </Button>
          <Button
            size="sm"
            onClick={() => document.getElementById('hemen-basla')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('nav.getStarted')}
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <AppChromeControls />
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--color-m-text)] transition-colors hover:bg-[var(--color-m-hover-overlay)]"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={tr.toggleMenu}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] lg:hidden"
          >
            <div className="mx-auto flex max-h-[min(70dvh,32rem)] max-w-7xl flex-col gap-1 overflow-y-auto px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-m-text)] hover:bg-[var(--color-m-hover-overlay)]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--color-m-card-border)] pt-4">
                <Button variant="secondary" size="sm" fullWidth onClick={onLogin}>
                  {t('nav.login')}
                </Button>
                <Button size="sm" fullWidth onClick={onRegister}>
                  {t('nav.getStarted')}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
