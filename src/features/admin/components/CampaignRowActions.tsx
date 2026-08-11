import {
  BarChart3,
  Eye,
  Pause,
  Pencil,
  Play,
  Square,
  Trash2,
} from 'lucide-react';
import { AdminIconAction, AdminRowActionsMenu, type AdminRowMenuItem } from '@/features/admin/components/AdminRowActionsMenu';
import type { SponsoredCampaign } from '@/types/marketing';

type CampaignRowActionsProps = {
  campaign: SponsoredCampaign;
  labels: {
    view: string;
    edit: string;
    metrics: string;
    pause: string;
    activate: string;
    end: string;
    delete: string;
    moreActions: string;
  };
  statusPending: boolean;
  endPending: boolean;
  onPause: (id: string) => void;
  onActivate: (id: string) => void;
  onEnd: (id: string) => void;
  onDelete: (id: string) => void;
};

export function CampaignRowActions({
  campaign,
  labels,
  statusPending,
  endPending,
  onPause,
  onActivate,
  onEnd,
  onDelete,
}: CampaignRowActionsProps) {
  const basePath = `/admin/marketing/${campaign.id}`;
  const menuItems: AdminRowMenuItem[] = [];

  if (campaign.status === 'active') {
    menuItems.push({
      type: 'button',
      label: labels.pause,
      icon: Pause,
      disabled: statusPending,
      onClick: () => onPause(campaign.id),
    });
  } else if (campaign.status === 'paused' || campaign.status === 'draft') {
    menuItems.push({
      type: 'button',
      label: labels.activate,
      icon: Play,
      disabled: statusPending,
      onClick: () => onActivate(campaign.id),
    });
  }

  if (campaign.status !== 'deleted') {
    if (menuItems.length) menuItems.push({ type: 'divider' });
    menuItems.push({
      type: 'button',
      label: labels.end,
      icon: Square,
      disabled: endPending,
      onClick: () => onEnd(campaign.id),
    });
    menuItems.push({ type: 'divider' });
    menuItems.push({
      type: 'button',
      label: labels.delete,
      icon: Trash2,
      destructive: true,
      onClick: () => onDelete(campaign.id),
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <AdminIconAction to={basePath} icon={Eye} label={labels.view} />
      <AdminIconAction to={`${basePath}/edit`} icon={Pencil} label={labels.edit} />
      <AdminIconAction to={`${basePath}/metrics`} icon={BarChart3} label={labels.metrics} />
      {menuItems.length ? (
        <AdminRowActionsMenu items={menuItems} triggerLabel={labels.moreActions} align="end" />
      ) : null}
    </div>
  );
}
