import type { MentorWalletTransactionType, PayoutRequestStatus } from '@/types/mentor-wallet';

export function transactionTypeLabel(type: MentorWalletTransactionType): string {
  switch (type) {
    case 'LESSON_EARNING_PENDING':
      return 'Lesson earning added';
    case 'LESSON_EARNING_AVAILABLE':
      return 'Earning released';
    case 'PAYOUT_REQUEST_CREATED':
      return 'Payout requested';
    case 'PAYOUT_COMPLETED':
      return 'Payout completed';
    case 'PAYOUT_FAILED':
      return 'Payout failed';
    case 'PAYOUT_CANCELLED':
      return 'Payout cancelled';
    case 'EARNING_REVERSAL':
      return 'Earning reversal';
    case 'MANUAL_ADJUSTMENT_ADD':
      return 'Manual adjustment';
    case 'MANUAL_ADJUSTMENT_REMOVE':
      return 'Manual deduction';
    case 'BONUS_EARNING':
      return 'Bonus earning';
    case 'SYSTEM_CORRECTION':
      return 'System correction';
    default:
      return type;
  }
}

export function payoutRequestStatusLabel(status: PayoutRequestStatus): string {
  switch (status) {
    case 'REQUESTED':
      return 'Requested';
    case 'APPROVED':
      return 'Approved';
    case 'PROCESSING':
      return 'Processing';
    case 'PAID':
      return 'Paid';
    case 'FAILED':
      return 'Failed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
}

export function maskIban(raw: string): string {
  const iban = raw?.trim() ?? '';
  if (!iban) return '';
  // If backend already masked, keep it.
  if (iban.includes('*')) return iban;
  const last4 = iban.replace(/\s+/g, '').slice(-4);
  if (!last4) return iban;
  return `TR** **** **** **** ${last4}`;
}

