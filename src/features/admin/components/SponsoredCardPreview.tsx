import { SponsoredCard } from '@/features/marketing/components/SponsoredCard';
import type { SponsoredCardPublic } from '@/types/marketing';

export function SponsoredCardPreview({ card }: { card: SponsoredCardPublic }) {
  return (
    <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)]/40 p-4">
      <SponsoredCard card={card} placement="search_results" preview className="shadow-none ring-0" />
    </div>
  );
}
