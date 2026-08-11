import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export interface ParentWalletSummary {
  id?: string;
  availableCredits?: number;
  heldCredits?: number;
  totalCredits?: number;
  totalPurchasedCredits?: number;
  totalUsedCredits?: number;
  totalRefundedCredits?: number;
  totalBonusCredits?: number;
  status?: string;
  // legacy field names
  credit_balance?: number;
  balance?: number;
  currency?: string;
}

export interface ParentWalletTransaction {
  id: string;
  type: string;
  direction?: string;
  amountCredits: number;
  status: string;
  description?: string;
  referenceType?: string;
  bookingId?: string;
  createdAt: string;
}

export interface ParentWalletTransactionPage {
  items: ParentWalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function fetchParentWalletMe(): Promise<ParentWalletSummary> {
  const { data } = await apiClient.get(endpoints.parentWallet.me);
  // The response interceptor already unwraps { success, data } → data.
  // After unwrap, `data` is { wallet: {...} } — access .wallet one level only.
  const d = data as { wallet?: ParentWalletSummary } & ParentWalletSummary;
  return d.wallet ?? d;
}

export async function fetchParentWalletTransactions(
  page = 1,
  limit = 20
): Promise<ParentWalletTransactionPage> {
  const { data } = await apiClient.get(endpoints.parentWallet.transactions, {
    params: { page, limit },
  });
  // Interceptor already unwrapped {success, data} → data = { items, pagination }
  return data as ParentWalletTransactionPage;
}

export async function parentWalletTopup(amountCredits: number): Promise<ParentWalletSummary> {
  const { data } = await apiClient.post(endpoints.parentWallet.dummyTopup, { amountCredits });
  const d = data as { wallet?: ParentWalletSummary } & ParentWalletSummary;
  return d.wallet ?? d;
}
