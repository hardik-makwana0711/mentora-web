import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore, roleHomePath } from '@/app/store/authStore';
import { Spinner } from '@/components/ui/Spinner';
import { LandingAIFeatures } from '@/features/landing/components/LandingAIFeatures';
import { LandingFinalCta } from '@/features/landing/components/LandingFinalCta';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { LandingHero } from '@/features/landing/components/LandingHero';
import { LandingHowItWorks } from '@/features/landing/components/LandingHowItWorks';
import { LandingMentorCta } from '@/features/landing/components/LandingMentorCta';
import { LandingNavbar } from '@/features/landing/components/LandingNavbar';
import { LandingProblem } from '@/features/landing/components/LandingProblem';
import { LandingTrust } from '@/features/landing/components/LandingTrust';
import { LandingValueByUser } from '@/features/landing/components/LandingValueByUser';
import { LandingLanguageProvider } from '@/features/landing/lib/landing-context';
import { landing } from '@/features/landing/lib/styles';

function LandingPageContent() {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === 'bootstrapping') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-surface-bg)]">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return (
    <div className={`${landing.page} overflow-x-hidden`}>
      <LandingNavbar
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
      />
      <main>
        <LandingHero
          onStartLearning={() => navigate('/register')}
          onApplyMentor={() => navigate('/register')}
        />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingAIFeatures />
        <LandingTrust />
        <LandingValueByUser />
        <LandingMentorCta onApplyMentor={() => navigate('/register')} />
        <LandingFinalCta
          onStartLearning={() => navigate('/register')}
          onApplyMentor={() => navigate('/register')}
        />
      </main>
      <LandingFooter />
    </div>
  );
}

export default function LandingPage() {
  return (
    <LandingLanguageProvider>
      <LandingPageContent />
    </LandingLanguageProvider>
  );
}
