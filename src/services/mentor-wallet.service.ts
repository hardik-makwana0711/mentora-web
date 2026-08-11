import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  MentorPayoutMethod,
  MentorPayoutRequest,
  MentorWalletMeResponse,
  MentorWalletTransaction,
  PaginatedResponse,
} from '@/types/mentor-wallet';

export async function fetchMentorWalletMe(): Promise<MentorWalletMeResponse> {
  const { data } = await apiClient.get<MentorWalletMeResponse>(endpoints.mentorWallet.me);
  return data;
}

export async function fetchMentorWalletTransactions(params: {
  page: number;
  limit: number;
  type?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  bookingId?: string;
  sessionId?: string;
  payoutRequestId?: string;
}): Promise<PaginatedResponse<MentorWalletTransaction>> {
  const { data } = await apiClient.get<PaginatedResponse<MentorWalletTransaction>>(
    endpoints.mentorWallet.transactions,
    { params }
  );
  return data;
}

export async function fetchMentorWalletPayoutRequests(params: {
  page: number;
  limit: number;
  status?: string;
}): Promise<PaginatedResponse<MentorPayoutRequest>> {
  const { data } = await apiClient.get<PaginatedResponse<MentorPayoutRequest>>(
    endpoints.mentorWallet.payoutRequests,
    { params }
  );
  return data;
}

export async function fetchMentorWalletPayoutMethods(): Promise<{ items: MentorPayoutMethod[] } | MentorPayoutMethod[]> {
  const { data } = await apiClient.get<{ items: MentorPayoutMethod[] } | MentorPayoutMethod[]>(
    endpoints.mentorWallet.payoutMethods
  );
  return data;
}

export async function createMentorWalletPayoutMethod(input: {
  methodType?: 'BANK_TRANSFER';
  accountHolderName: string;
  iban: string;
  bankName: string;
  branchName?: string;
  accountNumber?: string;
}): Promise<MentorPayoutMethod> {
  const { data } = await apiClient.post<MentorPayoutMethod>(endpoints.mentorWallet.payoutMethods, input);
  return data;
}

export async function updateMentorWalletPayoutMethod(
  payoutMethodId: string,
  input: Partial<{
    accountHolderName: string;
    iban: string;
    bankName: string;
    branchName?: string;
    accountNumber?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }>
): Promise<MentorPayoutMethod> {
  const { data } = await apiClient.patch<MentorPayoutMethod>(endpoints.mentorWallet.payoutMethod(payoutMethodId), input);
  return data;
}

export async function setDefaultMentorWalletPayoutMethod(payoutMethodId: string): Promise<void> {
  await apiClient.patch(endpoints.mentorWallet.payoutMethodDefault(payoutMethodId));
}

export async function deactivateMentorWalletPayoutMethod(payoutMethodId: string): Promise<void> {
  await apiClient.patch(endpoints.mentorWallet.payoutMethodDeactivate(payoutMethodId));
}

export async function createMentorWalletPayoutRequest(input: {
  amount: number;
  payoutMethodId?: string;
  idempotencyKey?: string;
}): Promise<{ item?: MentorPayoutRequest } | MentorPayoutRequest> {
  const { data } = await apiClient.post<{ item?: MentorPayoutRequest } | MentorPayoutRequest>(
    endpoints.mentorWallet.payoutRequests,
    input
  );
  return data;
}
