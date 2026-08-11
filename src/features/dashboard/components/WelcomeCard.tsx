import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { translateWelcomeMessage } from '@/lib/translate-dashboard';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';

type WelcomeCardProps = {
  name: string;
  welcomeMessage: string;
  avatarUrl: string | null;
};

export function WelcomeCard({ name, welcomeMessage, avatarUrl }: WelcomeCardProps) {
  return (
    <DashboardPanelCard>
      <div className="flex items-center gap-4">
        <PresignedAvatar storedUrl={avatarUrl} name={name} className="size-14 shrink-0" />
        <div className="min-w-0">
          <p className="text-xl font-semibold text-[var(--color-m-text)] sm:text-2xl">
            {translateWelcomeMessage(welcomeMessage, name)}
          </p>
        </div>
      </div>
    </DashboardPanelCard>
  );
}
