import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AppChromeControls } from '@/components/ui/AppChromeControls';
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
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#nasil-calisir', label: t('nav.howItWorks') },
    { href: '#guven', label: t('nav.trust') },
    { href: '#yapay-zeka', label: t('nav.ai') },
    { href: '#mentor-ol', label: t('nav.becomeMentor') },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[var(--color-m-card-border)] bg-[var(--color-m-bg)]/95 shadow-[var(--shadow-m-card)] backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5" aria-label={t('nav.brandAria')}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-m-primary)] to-[var(--color-m-gradient-end)] text-lg font-bold text-white shadow-[var(--shadow-m-glow)]">
            M
          </span>
          <span className="text-xl font-bold text-[var(--color-m-text)] transition-colors group-hover:text-[var(--color-m-primary-light)]">
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
          <Button size="sm" onClick={() => document.getElementById('hemen-basla')?.scrollIntoView({ behavior: 'smooth' })}>
            {t('nav.getStarted')}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <AppChromeControls />
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--color-m-text)] transition-colors hover:bg-[var(--color-m-hover-overlay)]"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={tr.toggleMenu}
          >
            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--color-m-card-border)] lg:hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-2 text-sm font-medium text-[var(--color-m-text-secondary)]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 border-t border-[var(--color-m-card-border)] pt-4">
                <Button variant="ghost" size="sm" onClick={onLogin}>
                  {t('nav.login')}
                </Button>
                <Button size="sm" onClick={onRegister}>
                  {t('nav.getStarted')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
