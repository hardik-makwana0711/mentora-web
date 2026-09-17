import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import {
  contactRequestStatusLabelKey,
  contactRequestStatusVariant,
  contactRequestTypeLabelKey,
} from '@/features/mentor/lib/contact-request-labels';
import type { ContactRequest } from '@/types/contact-requests';

function fmtDate(value?: string | Date | null): string {
  if (!value) return '—';
  try {
    return format(new Date(value), 'PPp', { locale: getDateFnsLocale() });
  } catch {
    return '—';
  }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[var(--color-m-text)]">{value}</p>
    </div>
  );
}

export function ContactRequestDetailDrawer({
  request,
  open,
  onClose,
  onAccept,
  onDecline,
  isAccepting,
}: {
  request: ContactRequest | null;
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting?: boolean;
}) {
  const tr = useStrings();
  if (!request) return null;

  const isParentSubmitted = Boolean(request.student);
  const studentName = isParentSubmitted
    ? (request.student!.name ?? '—')
    : (request.requester?.name ?? '—');

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={tr.contactRequestDetailsTitle}
      panelClassName="w-full sm:w-[420px]"
      footer={
        request.status === 'pending' ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onDecline}>
              {tr.rejectRequestBtn}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isAccepting}
              onClick={onAccept}
            >
              {tr.acceptRequest}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
            {tr.contactRequestStatusLabel}
          </p>
          <Badge variant={contactRequestStatusVariant(request.status)}>
            {tr[contactRequestStatusLabelKey(request.status)]}
          </Badge>
        </div>

        <Field label={tr.roleStudent} value={studentName} />
        {isParentSubmitted ? (
          <Field label={tr.roleParent} value={request.requester?.name ?? '—'} />
        ) : null}
        {request.requester?.email ? (
          <Field label={tr.emailPlaceholder} value={request.requester.email} />
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <Field label={tr.subjectField} value={request.subject ?? tr.notProvided} />
          <Field label={tr.gradeLevel} value={request.gradeLevel ?? tr.notProvided} />
        </div>

        {request.examType ? <Field label={tr.examType} value={request.examType} /> : null}
        {request.preferredTeachingFormat ? (
          <Field label={tr.teachingFormat} value={request.preferredTeachingFormat} />
        ) : null}
        {request.preferredDays.length > 0 ? (
          <Field label={tr.preferredDays} value={request.preferredDays.join(', ')} />
        ) : null}
        {request.preferredTimeSlots.length > 0 ? (
          <Field label={tr.preferredTimeSlots} value={request.preferredTimeSlots.join(', ')} />
        ) : null}

        <Field label={tr.requestType} value={tr[contactRequestTypeLabelKey(request.requestType)]} />
        <Field label={tr.contactRequestSubmittedLabel} value={fmtDate(request.createdAt)} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
            {tr.messageLabel}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-m-text-secondary)]">
            {request.message || tr.contactRequestNoMessage}
          </p>
        </div>

        {request.mentorResponseMessage ? (
          <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-3">
            <Field
              label={tr.contactRequestMentorResponseLabel}
              value={request.mentorResponseMessage}
            />
            <p className="mt-2 text-xs text-[var(--color-m-text-muted)]">
              {tr.contactRequestRespondedAtLabel}: {fmtDate(request.respondedAt)}
            </p>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
