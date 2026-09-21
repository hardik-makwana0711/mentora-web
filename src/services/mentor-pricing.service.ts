import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export interface MentorPricingPackage {
  name: string;
  lessons: number;
  price: number;
}

export interface MentorPricing {
  currency: string;
  hourly_price: number | null;
  trial_lesson_price: number | null;
  package_options: MentorPricingPackage[];
  is_public: boolean;
}

export interface UpdateMentorPricingInput {
  currency: string;
  hourly_price?: number | null;
  trial_lesson_price?: number | null;
  package_options?: MentorPricingPackage[];
  is_public?: boolean;
}

export const mentorPricingService = {
  /** Public summary endpoint, gated behind approved+public+active — returns null if not yet reachable (e.g. still restricted). */
  async getMine(mentorId: string): Promise<MentorPricing | null> {
    try {
      const { data } = await apiClient.get<MentorPricing>(
        endpoints.mentors.pricingSummary(mentorId)
      );
      return data;
    } catch {
      return null;
    }
  },

  async update(input: UpdateMentorPricingInput): Promise<MentorPricing> {
    const { data } = await apiClient.patch<{ pricing: MentorPricing }>(
      endpoints.mentors.updatePricing,
      input
    );
    return data.pricing;
  },
};
