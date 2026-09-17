import type { Strings } from '@/constants/strings';
import type { ContactRequestStatus, ContactRequestType } from '@/types/contact-requests';

type BadgeVariant = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

const STATUS_LABEL_KEY: Record<ContactRequestStatus, keyof Strings> = {
  pending: 'statusPending',
  accepted: 'statusAccepted',
  rejected: 'statusRejected',
  cancelled: 'statusCancelled',
  completed: 'statusCompleted',
};

const STATUS_VARIANT: Record<ContactRequestStatus, BadgeVariant> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  cancelled: 'default',
  completed: 'success',
};

export function contactRequestStatusLabelKey(status: ContactRequestStatus): keyof Strings {
  return STATUS_LABEL_KEY[status];
}

export function contactRequestStatusVariant(status: ContactRequestStatus): BadgeVariant {
  return STATUS_VARIANT[status];
}

const TYPE_LABEL_KEY: Record<ContactRequestType, keyof Strings> = {
  contact: 'requestTypeContact',
  trial: 'requestTypeTrial',
  regular_lesson: 'requestTypeRegular',
};

export function contactRequestTypeLabelKey(type: ContactRequestType): keyof Strings {
  return TYPE_LABEL_KEY[type];
}

export const CONTACT_REQUEST_STATUS_TABS: ('all' | ContactRequestStatus)[] = [
  'all',
  'pending',
  'accepted',
  'rejected',
  'cancelled',
];

export function contactRequestTabLabelKey(tab: 'all' | ContactRequestStatus): keyof Strings {
  if (tab === 'all') return 'contactRequestsTabAll';
  return STATUS_LABEL_KEY[tab];
}
