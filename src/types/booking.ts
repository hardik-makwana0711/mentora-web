import type { AvailabilityWindow } from '@/types/search';

export type BookingPlanType =
  | 'single_lesson'
  | 'five_pack'
  | 'ten_pack'
  | 'custom_pack'
  | 'use_remaining_credits';

export type CreateBookingPayload =
  | {
      listing_id: string;
      slot_start: string;
      slot_end: string;
      plan_type: 'single_lesson' | 'use_remaining_credits';
      student_id?: string | null;
      currency: 'TRY';
    }
  | {
      mentor_id: string;
      slot_ids: string[];
      plan_type: BookingPlanType;
      student_id?: string | null;
      currency: 'TRY';
    };

export type BookingSlotSummary = {
  slot_id: string;
  start_time: string;
  end_time: string;
  status: string;
};

export type BookingSummary = {
  booking_id: string;
  mentor_summary?: {
    mentor_id: string;
    mentor_name: string;
  };
  selected_slots: BookingSlotSummary[];
  selected_plan?: BookingPlanType;
  plan_type?: BookingPlanType;
  total_credits: number;
  used_credits: number;
  purchased_credits: number;
  total_price: number;
  currency: string;
  booking_status: string;
  checkout_summary?: {
    checkout_status?: string;
    requires_dummy_checkout?: boolean;
  };
};

export type BookingFlowState = {
  listingId: string;
  mentorId: string;
  mentorName: string;
  subject: string;
  lessonCount: number;
  slots: AvailabilityWindow[];
  studentId?: string | null;
  price: number | null;
};
