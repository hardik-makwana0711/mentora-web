import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import i18n from '@/i18n';
import type { AvailabilityWindow } from '@/types/search';
import type { BookingSummary, CreateBookingPayload } from '@/types/booking';
import { searchService } from '@/services/search.service';

export async function createBooking(payload: CreateBookingPayload): Promise<BookingSummary> {
  const { data } = await apiClient.post<BookingSummary>(endpoints.bookings.create, payload);
  return normalizeBookingSummary(data);
}

export async function checkoutBooking(bookingId: string): Promise<BookingSummary> {
  const { data } = await apiClient.post<BookingSummary>(endpoints.bookings.checkout(bookingId), {
    confirm: true,
  });
  return normalizeBookingSummary(data);
}

function unwrapBookingPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return obj.data as Record<string, unknown>;
  }
  return obj;
}

function normalizeBookingSummary(raw: unknown): BookingSummary {
  const data = unwrapBookingPayload(raw);
  const mentorRaw = data.mentor_summary;
  const mentor =
    mentorRaw && typeof mentorRaw === 'object'
      ? (mentorRaw as BookingSummary['mentor_summary'])
      : undefined;

  const slotsRaw = data.selected_slots;
  const selected_slots = Array.isArray(slotsRaw)
    ? (slotsRaw as BookingSummary['selected_slots'])
    : [];

  const plan = (data.selected_plan ?? data.plan_type) as BookingSummary['plan_type'] | undefined;

  return {
    booking_id: String(data.booking_id ?? data.id ?? ''),
    mentor_summary: mentor ?? { mentor_id: '', mentor_name: '' },
    selected_slots,
    selected_plan: plan,
    plan_type: (data.plan_type ?? plan) as BookingSummary['plan_type'] | undefined,
    total_credits: Number(data.total_credits ?? 0),
    used_credits: Number(data.used_credits ?? 0),
    purchased_credits: Number(data.purchased_credits ?? 0),
    total_price: Number(data.total_price ?? 0),
    currency: String(data.currency ?? 'TRY'),
    booking_status: String(data.booking_status ?? data.status ?? 'pending'),
    checkout_summary:
      data.checkout_summary && typeof data.checkout_summary === 'object'
        ? (data.checkout_summary as BookingSummary['checkout_summary'])
        : undefined,
  };
}

/** Listing slots are `{ start, end }` only; multi-slot bookings need persisted `db_slot_id` values. */
export async function resolveDbSlotIds(
  mentorId: string,
  slots: AvailabilityWindow[]
): Promise<string[]> {
  if (!slots.length) throw new Error('No slots selected');

  const dates = slots.map((s) => s.start.slice(0, 10)).sort();
  const startDate = dates[0]!;
  const endDate = dates[dates.length - 1]!;

  const availability = await searchService.getMentorAvailability(mentorId, startDate, endDate);

  return slots.map((slot) => {
    const match = availability.find(
      (row) =>
        row.status === 'available' &&
        new Date(row.start_time).getTime() === new Date(slot.start).getTime() &&
        new Date(row.end_time).getTime() === new Date(slot.end).getTime()
    );
    if (!match?.db_slot_id) {
      throw new Error(i18n.t('slotNoLongerAvailable'));
    }
    return match.db_slot_id;
  });
}

export async function createBookingFromFlow(input: {
  listingId: string;
  mentorId: string;
  lessonCount: number;
  slots: AvailabilityWindow[];
  studentId?: string | null;
}): Promise<BookingSummary> {
  const { listingId, mentorId, lessonCount, slots, studentId } = input;

  if (lessonCount === 1 && slots.length === 1) {
    const slot = slots[0]!;
    return createBooking({
      listing_id: listingId,
      slot_start: slot.start,
      slot_end: slot.end,
      plan_type: 'single_lesson',
      student_id: studentId ?? null,
      currency: 'TRY',
    });
  }

  const slotIds = await resolveDbSlotIds(mentorId, slots);
  return createBooking({
    mentor_id: mentorId,
    slot_ids: slotIds,
    plan_type: 'custom_pack',
    student_id: studentId ?? null,
    currency: 'TRY',
  });
}
