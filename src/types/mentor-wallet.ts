export type MentorWalletStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export type MentorWalletTransactionType =
  | 'LESSON_EARNING_PENDING'
  | 'LESSON_EARNING_AVAILABLE'
  | 'PAYOUT_REQUEST_CREATED'
  | 'PAYOUT_COMPLETED'
  | 'PAYOUT_FAILED'
  | 'PAYOUT_CANCELLED'
  | 'EARNING_REVERSAL'
  | 'MANUAL_ADJUSTMENT_ADD'
  | 'MANUAL_ADJUSTMENT_REMOVE'
  | 'BONUS_EARNING'
  | 'SYSTEM_CORRECTION';

export type MentorWalletTransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';

export type MentorWalletTransactionDirection = 'IN' | 'OUT' | 'MOVE';

export type MentorWalletTransactionReferenceType =
  | 'SESSION'
  | 'BOOKING'
  | 'PAYOUT_REQUEST'
  | 'SYSTEM'
  | 'ADMIN';

export type MentorPayoutMethodStatus = 'ACTIVE' | 'INACTIVE';

export type PayoutRequestStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REJECTED';

export interface MentorWalletSummary {
  id: string;
  mentorUserId: string;
  pendingBalance: string | number;
  availableBalance: string | number;
  totalBalance: string | number;
  totalEarned: string | number;
  totalPaidOut: string | number;
  totalReversed: string | number;
  totalBonuses: string | number;
  currency: string;
  status: MentorWalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MentorWalletMeResponse {
  wallet: MentorWalletSummary;
}

export interface MentorWalletTransaction {
  id: string;
  walletId: string;
  mentorUserId: string;
  type: MentorWalletTransactionType;
  direction: MentorWalletTransactionDirection;
  amount: number;
  currency: string;
  status: MentorWalletTransactionStatus;
  description: string;
  referenceType: MentorWalletTransactionReferenceType;
  referenceId: string;
  bookingId?: string;
  sessionId?: string;
  payoutRequestId?: string;
  createdAt: string;
}

export interface MentorPayoutMethod {
  id: string;
  mentorUserId: string;
  methodType: 'BANK_TRANSFER';
  accountHolderName: string;
  /** Masked by backend (preferred) */
  ibanMasked?: string | null;
  /** Legacy / fallback masked field */
  iban?: string;
  bankName: string;
  branchName?: string;
  /** Only last 4 digits returned by backend (preferred) */
  accountNumberLast4?: string | null;
  /** Legacy / fallback (should not be a full account number) */
  accountNumber?: string;
  isDefault: boolean;
  status: MentorPayoutMethodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MentorPayoutRequest {
  id: string;
  mentorUserId: string;
  walletId: string;
  payoutMethodId: string;
  amount: number;
  currency: string;
  status: PayoutRequestStatus;
  requestedAt: string;
  processedAt?: string;
  paidAt?: string;
  failureReason?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  pagination: PaginationMeta;
}
