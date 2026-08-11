import { Badge } from '@/components/ui/Badge';
import { useStrings } from '@/constants/strings';
import { displayCampaignStatus } from '@/features/admin/lib/marketing-labels';
import type { SponsoredCampaignStatus } from '@/types/marketing';

function variantForStatus(status: SponsoredCampaignStatus | 'ended') {
  if (status === 'active') return 'success' as const;
  if (status === 'paused' || status === 'ended') return 'warning' as const;
  if (status === 'deleted') return 'danger' as const;
  return 'default' as const;
}

export function CampaignStatusBadge({
  status,
  endDate,
}: {
  status: SponsoredCampaignStatus;
  endDate: string;
}) {
  const tr = useStrings();
  const display = displayCampaignStatus(status, endDate);
  const labelKey = `marketingStatus${display.charAt(0).toUpperCase()}${display.slice(1)}` as keyof typeof tr;
  const label = (tr[labelKey] as string | undefined) ?? display;

  return <Badge variant={variantForStatus(display)}>{label}</Badge>;
}
