import { useAuthStore } from '@/app/store/authStore';
import { useSponsoredCard } from '@/features/marketing/hooks/useSponsoredCard';
import { SponsoredCard } from '@/features/marketing/components/SponsoredCard';
import { useStrings } from '@/constants/strings';
import type { SponsoredCampaignPlacement } from '@/types/marketing';

type Props = {
  studentId?: string;
  subject?: string;
  examType?: string;
};

export function DashboardSponsoredSection({ studentId, subject, examType }: Props) {
  const tr = useStrings();
  const role = useAuthStore((s) => s.user?.role);

  let placement: SponsoredCampaignPlacement | null = null;
  if (role === 'student') placement = 'student_dashboard';
  else if (role === 'parent') placement = 'parent_dashboard';

  const { card, trackImpression } = useSponsoredCard({
    placement: placement ?? 'student_dashboard',
    subject,
    examType,
    studentId,
    enabled: !!placement,
  });

  if (!placement || !card) return null;

  return (
    <section aria-label={tr.marketingDashboardSectionTitle}>
      <h2 className="mb-3 text-sm font-semibold text-[var(--color-m-text-muted)]">
        {tr.marketingDashboardSectionTitle}
      </h2>
      <SponsoredCard card={card} placement={placement} onVisible={trackImpression} />
    </section>
  );
}
