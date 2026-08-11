import { SponsoredCard } from '@/features/marketing/components/SponsoredCard';
import { useSponsoredCard } from '@/features/marketing/hooks/useSponsoredCard';
import type { SponsoredCampaignPlacement } from '@/types/marketing';

type Props = {
  placement: SponsoredCampaignPlacement;
  subject?: string;
  examType?: string;
  studentId?: string;
  className?: string;
};

export function SponsoredCardPlacement({
  placement,
  subject,
  examType,
  studentId,
  className,
}: Props) {
  const { card, trackImpression } = useSponsoredCard({
    placement,
    subject,
    examType,
    studentId,
  });

  if (!card) return null;

  return (
    <SponsoredCard
      card={card}
      placement={placement}
      className={className}
      onVisible={trackImpression}
    />
  );
}
