import { Badge } from '@/components/ui/Badge';
import {
  formatListingModerationStatus,
  formatProfileModerationStatus,
} from '@/features/admin/lib/admin-labels';

function variantForStatus(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  if (status === 'approved' || status === 'active') return 'success';
  if (status === 'pending_review' || status === 'pending') return 'warning';
  if (status === 'rejected' || status === 'suspended' || status === 'hidden_by_admin') return 'danger';
  if (status === 'changes_requested') return 'info';
  return 'default';
}

export function ModerationStatusBadge({
  status,
  kind = 'profile',
}: {
  status: string;
  kind?: 'profile' | 'listing' | 'account';
}) {
  const label =
    kind === 'listing'
      ? formatListingModerationStatus(status)
      : kind === 'profile'
        ? formatProfileModerationStatus(status)
        : status;

  return <Badge variant={variantForStatus(status)}>{label}</Badge>;
}
