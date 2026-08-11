import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { Card } from '@/components/ui/Card';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { Spinner } from '@/components/ui/Spinner';
import { LessonCountSelector } from '@/features/search/components/LessonCountSelector';
import { DateFirstSlotPicker } from '@/features/search/components/DateFirstSlotPicker';
import { BookingSummaryCard } from '@/features/search/components/BookingSummaryCard';
import { useAvailableSlots } from '@/features/search/hooks/useAvailableSlots';
import { createBookingFromFlow } from '@/services/bookings.service';
import { profileService } from '@/services/profile.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import type { AvailabilityWindow } from '@/types/search';

export default function BookingStartPage() {
  const tr = useStrings();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const user = useAuthStore((s) => s.user);
  const isParent = user?.role === 'parent';

  const listingId = params.get('listingId') ?? '';
  const mentorId = params.get('mentorId') ?? '';
  const mentorName = params.get('mentorName') ?? '';
  const subject = params.get('subject') ?? '';
  const price = params.get('price') ? Number(params.get('price')) : null;

  const [step, setStep] = useState(1);
  const [lessonCount, setLessonCount] = useState(1);
  const [selectedSlots, setSelectedSlots] = useState<AvailabilityWindow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isParent) {
      toast.error(tr.parentOnlyBooking);
      navigate(`${roleBase}/search`, { replace: true });
    }
  }, [user, isParent, navigate, roleBase]);

  const profileQ = useQuery({
    queryKey: user?.id ? qk.profile(user.id) : ['profile', 'none'],
    queryFn: () => profileService.getMe(),
    enabled: isParent && Boolean(user?.id),
  });

  const linkedStudents = profileQ.data?.parent_profile?.linked_students ?? [];
  const requiresStudent = isParent && linkedStudents.length > 0;

  useEffect(() => {
    if (linkedStudents.length === 1 && !selectedStudentId) {
      setSelectedStudentId(linkedStudents[0]!.id);
    }
  }, [linkedStudents, selectedStudentId]);

  const slotsQuery = useAvailableSlots(listingId, Boolean(listingId) && step >= 2 && isParent);

  function toggleSlot(slot: AvailabilityWindow) {
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.start === slot.start);
      if (exists) return prev.filter((s) => s.start !== slot.start);
      if (prev.length >= lessonCount) return prev;
      return [...prev, slot];
    });
  }

  async function handleNext() {
    if (step === 1) {
      if (requiresStudent && !selectedStudentId) {
        toast.error(tr.selectStudentHint);
        return;
      }
      setSelectedSlots([]);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (selectedSlots.length !== lessonCount) {
        toast.error(tr.selectSlotsHint);
        return;
      }
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await createBookingFromFlow({
        listingId,
        mentorId,
        lessonCount,
        slots: selectedSlots,
        studentId: isParent ? selectedStudentId || null : null,
      });

      navigate(`${roleBase}/search/booking/payment`, {
        state: {
          booking,
          flow: {
            listingId,
            mentorId,
            mentorName,
            subject,
            lessonCount,
            slots: selectedSlots,
            studentId: isParent ? selectedStudentId : null,
            price,
          },
        },
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ??
        (err as Error)?.message ??
        tr.bookingCreateFailed;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isParent) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (!listingId || !mentorId) {
    return (
      <Card className="p-6 text-center text-[var(--color-m-text-muted)]">
        {tr.invalidBookingLink}{' '}
        <TextLink to={`${roleBase}/search`}>{tr.findMentor}</TextLink>
      </Card>
    );
  }

  return (
    <PageContainer width="form">
      <BackLink to={`${roleBase}/search/listings/${listingId}`}>{tr.back}</BackLink>

      <h1 className="text-xl font-bold text-[var(--color-m-text)]">
        {tr.bookingStep} {step}/3
      </h1>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[var(--color-m-primary)]' : 'bg-[var(--color-m-card-border)]'}`}
          />
        ))}
      </div>

      <div className="mt-8">
        {step === 1 ? (
          <div className="space-y-6">
            {requiresStudent ? (
              <DropdownSelect
                label={tr.selectStudent}
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                options={linkedStudents.map((s) => ({ value: s.id, label: s.name }))}
              />
            ) : null}
            <LessonCountSelector
              count={lessonCount}
              onChange={(n) => {
                setLessonCount(n);
                setSelectedSlots([]);
              }}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <DateFirstSlotPicker
            slots={slotsQuery.data ?? []}
            selected={selectedSlots}
            maxSelection={lessonCount}
            isLoading={slotsQuery.isPending}
            isError={slotsQuery.isError}
            onRetry={() => void slotsQuery.refetch()}
            onToggle={toggleSlot}
          />
        ) : null}

        {step === 3 ? (
          <BookingSummaryCard
            mentorName={mentorName}
            subject={subject}
            lessonCount={lessonCount}
            slots={selectedSlots}
            estimatedTotal={price != null ? price * lessonCount : null}
            studentName={
              selectedStudentId
                ? (linkedStudents.find((s) => s.id === selectedStudentId)?.name ?? null)
                : null
            }
          />
        ) : null}
      </div>

      <div className="mt-8 flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          disabled={isSubmitting}
        >
          {tr.back}
        </Button>
        <Button type="button" className="flex-1" onClick={() => void handleNext()} disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner className="size-4" />
              {tr.processing}
            </span>
          ) : step === 3 ? (
            tr.continueToPayment
          ) : (
            tr.submit
          )}
        </Button>
      </div>
    </PageContainer>
  );
}
