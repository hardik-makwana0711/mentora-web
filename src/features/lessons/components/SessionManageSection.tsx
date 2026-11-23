import { useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addDays, format } from 'date-fns';

import { CalendarClock, CircleAlert, XCircle } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';

import { Modal } from '@/components/ui/Modal';

import { Spinner } from '@/components/ui/Spinner';

import { Textarea } from '@/components/ui/Textarea';

import { qk } from '@/constants/query-keys';

import { useStrings } from '@/constants/strings';

import { formatLessonDateTime } from '@/features/lessons/lib/lessons-utils';

import i18n from '@/i18n';

import { normAxios } from '@/lib/norm-axios';

import {
  cancelSession,
  reportNoShow,
  rescheduleSession,
  respondToNoShow,
} from '@/services/lessons.service';

import { searchService } from '@/services/search.service';

import type { SessionDetail } from '@/types/lessons';

/** Backend error codes → friendly text. */
function errorText(e: unknown, tr: ReturnType<typeof useStrings>): string {
  const msg = normAxios(e, tr.lessonChangeFailed);
  if (msg.includes('RESCHEDULE_TOO_LATE')) return tr.rescheduleTooLate;
  if (msg.includes('RESCHEDULE_LIMIT_REACHED')) return tr.rescheduleLimitReached;
  if (msg.includes('SLOT_NOT_AVAILABLE') || msg.includes('BOOKING_CONFLICT'))
    return tr.slotTakenError;
  if (/^[A-Z_]+$/.test(msg)) return tr.lessonChangeFailed;
  return msg;
}

function cancelledText(d: SessionDetail, tr: ReturnType<typeof useStrings>): string | null {
  switch (d.cancellation_kind) {
    case 'PARENT_ON_TIME':
      return tr.cancelledOnTime;
    case 'PARENT_LATE':
      return tr.cancelledLate;
    case 'MENTOR':
      return tr.cancelledByMentor;
    case 'STUDENT_NO_SHOW':
      return tr.cancelledStudentNoShow;
    case 'MENTOR_NO_SHOW':
      return tr.cancelledMentorNoShow;
    case 'ADMIN':
      return tr.cancelledByAdmin;
    default:
      return null;
  }
}

export function SessionManageSection({
  session: d,
  isMentor,
}: {
  session: SessionDetail;
  isMentor: boolean;
}) {
  const tr = useStrings();
  const qc = useQueryClient();
  const actions = d.actions;
  const report = d.no_show_report ?? null;

  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [pickedStart, setPickedStart] = useState<string | null>(null);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: qk.sessionDetail(d.session_id) });
    void qc.invalidateQueries({ queryKey: ['lessons'] });
    void qc.invalidateQueries({ queryKey: ['sessions'] });
    void qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const cancelM = useMutation({
    mutationFn: () => cancelSession(d.session_id, reason.trim() || undefined),
    onSuccess: (out) => {
      toast.success(out.credit_refunded ? tr.lessonCancelledRefundToast : tr.lessonCancelledToast);
      setCancelOpen(false);
      refresh();
    },
    onError: (e) => toast.error(errorText(e, tr)),
  });

  const rescheduleM = useMutation({
    mutationFn: () => rescheduleSession(d.session_id, pickedStart!),
    onSuccess: () => {
      toast.success(tr.lessonMovedToast);
      setRescheduleOpen(false);
      setPickedStart(null);
      refresh();
    },
    onError: (e) => toast.error(errorText(e, tr)),
  });

  const noShowM = useMutation({
    mutationFn: () => reportNoShow(d.session_id, note.trim() || undefined),
    onSuccess: () => {
      toast.success(tr.noShowReportedToast);
      setNoShowOpen(false);
      setNote('');
      refresh();
    },
    onError: (e) => toast.error(errorText(e, tr)),
  });

  const respondM = useMutation({
    mutationFn: (response: 'agree' | 'dispute') =>
      respondToNoShow(d.session_id, report!.report_id, response),
    onSuccess: () => {
      toast.success(tr.noShowAnsweredToast);
      refresh();
    },
    onError: (e) => toast.error(errorText(e, tr)),
  });

  // Free hours for the next 14 days, same source as booking.
  const slotsQ = useQuery({
    queryKey: ['mentor-availability', d.mentor_id, 'reschedule'],
    enabled: rescheduleOpen,
    staleTime: 0,
    queryFn: async () => {
      const today = new Date();
      const rows = await searchService.getMentorAvailability(
        d.mentor_id,
        format(today, 'yyyy-MM-dd'),
        format(addDays(today, 14), 'yyyy-MM-dd')
      );
      const now = Date.now();
      return rows
        .filter((r) => r.status === 'available' && new Date(r.start_time).getTime() > now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    },
  });

  const slotsByDay = useMemo(() => {
    const map = new Map<string, { start: string }[]>();
    for (const r of slotsQ.data ?? []) {
      const key = format(new Date(r.start_time), 'yyyy-MM-dd');
      const list = map.get(key) ?? [];
      list.push({ start: r.start_time });
      map.set(key, list);
    }
    return [...map.entries()];
  }, [slotsQ.data]);

  const banner = d.status === 'cancelled' ? cancelledText(d, tr) : null;

  const reportBanner = (() => {
    if (!report || report.status !== 'OPEN') return null;
    if (report.can_respond) return null;
    if (report.counterpart_response === 'disputed') return tr.noShowPendingDisputed;
    if (report.reported_by_me) return tr.noShowPendingMine;
    return tr.noShowPendingDisputed;
  })();

  const showButtons = Boolean(
    actions && (actions.can_cancel || actions.can_reschedule || actions.can_report_no_show)
  );

  if (!banner && !reportBanner && !report?.can_respond && !showButtons) return null;

  return (
    <div className="mt-6 space-y-3">
      {banner ? (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-m-bg)] p-3">
          <XCircle className="mt-0.5 size-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
          <div className="text-sm text-[var(--color-text-secondary)]">
            <p>{banner}</p>
            {d.cancellation_reason ? <p className="mt-1 text-xs">{d.cancellation_reason}</p> : null}
          </div>
        </div>
      ) : null}

      {reportBanner ? (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-m-bg)] p-3">
          <CircleAlert
            className="mt-0.5 size-4 shrink-0 text-[var(--color-text-muted)]"
            aria-hidden
          />
          <p className="text-sm text-[var(--color-text-secondary)]">{reportBanner}</p>
        </div>
      ) : null}

      {report?.can_respond ? (
        <div className="rounded-xl border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/10 p-4">
          <p className="text-sm text-[var(--color-m-text)]">
            {report.kind === 'STUDENT_NO_SHOW' ? tr.noShowAskStudent : tr.noShowAskMentor}
          </p>
          {report.note ? (
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">“{report.note}”</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={respondM.isPending}
              onClick={() => respondM.mutate('agree')}
            >
              {tr.noShowAgree}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={respondM.isPending}
              onClick={() => respondM.mutate('dispute')}
            >
              {tr.noShowDispute}
            </Button>
          </div>
        </div>
      ) : null}

      {showButtons ? (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-m-text)]">
            {tr.manageLessonTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {actions?.can_reschedule ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setRescheduleOpen(true)}
              >
                <CalendarClock className="size-4" />
                {tr.rescheduleLesson}
              </Button>
            ) : null}
            {actions?.can_cancel ? (
              <Button type="button" size="sm" variant="danger" onClick={() => setCancelOpen(true)}>
                {tr.cancelLesson}
              </Button>
            ) : null}
            {actions?.can_report_no_show ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setNoShowOpen(true)}
              >
                {tr.reportNoShow}
              </Button>
            ) : null}
          </div>
          {actions && !actions.can_reschedule && actions.can_cancel ? (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              {actions.reschedule_blocked_reason === 'limit_reached'
                ? tr.rescheduleLimitReached
                : tr.rescheduleTooLate}
            </p>
          ) : null}
        </div>
      ) : null}

      <Modal
        open={cancelOpen}
        title={tr.cancelLessonTitle}
        onClose={() => setCancelOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              {tr.keepLesson}
            </Button>
            <Button variant="danger" disabled={cancelM.isPending} onClick={() => cancelM.mutate()}>
              {tr.confirmCancel}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          {formatLessonDateTime(d.scheduled_at)}
        </p>
        <p className="mt-3 text-sm text-[var(--color-m-text)]">
          {isMentor
            ? tr.cancelMentorInfo
            : actions?.cancel_is_late
              ? tr.cancelLateInfo
              : tr.cancelOnTimeInfo}
        </p>
        <label className="mt-4 block text-sm font-medium text-[var(--color-m-text)]">
          {tr.cancelReasonLabel}
          <Textarea
            className="mt-1"
            rows={2}
            maxLength={500}
            value={reason}
            placeholder={tr.cancelReasonPlaceholder}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
      </Modal>

      <Modal
        open={rescheduleOpen}
        title={tr.rescheduleTitle}
        onClose={() => {
          setRescheduleOpen(false);
          setPickedStart(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRescheduleOpen(false)}>
              {tr.keepLesson}
            </Button>
            <Button
              disabled={!pickedStart || rescheduleM.isPending}
              onClick={() => rescheduleM.mutate()}
            >
              {tr.rescheduleConfirm}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          {i18n.t('rescheduleInfo', { count: actions?.reschedules_left ?? 0 })}
        </p>
        <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto">
          {slotsQ.isPending ? (
            <div className="flex justify-center py-6">
              <Spinner className="size-8" />
            </div>
          ) : slotsByDay.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">{tr.rescheduleNoSlots}</p>
          ) : (
            slotsByDay.map(([day, slots]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-medium uppercase text-[var(--color-text-muted)]">
                  {formatLessonDateTime(slots[0]!.start).replace(/\s\d{2}:\d{2}$/, '')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => {
                    const selected = pickedStart === s.start;
                    return (
                      <button
                        key={s.start}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setPickedStart(s.start)}
                        className={
                          selected
                            ? 'rounded-lg border border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] px-3 py-1.5 text-sm font-medium text-white'
                            : 'rounded-lg border border-[var(--color-surface-border)] px-3 py-1.5 text-sm text-[var(--color-m-text)] hover:border-[var(--color-brand-primary)]'
                        }
                      >
                        {format(new Date(s.start), 'HH:mm')}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      <Modal
        open={noShowOpen}
        title={tr.noShowTitle}
        onClose={() => setNoShowOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setNoShowOpen(false)}>
              {tr.keepLesson}
            </Button>
            <Button disabled={noShowM.isPending} onClick={() => noShowM.mutate()}>
              {tr.noShowSubmit}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-m-text)]">
          {actions?.no_show_report_kind === 'STUDENT_NO_SHOW'
            ? tr.noShowStudentInfo
            : tr.noShowMentorInfo}
        </p>
        <label className="mt-4 block text-sm font-medium text-[var(--color-m-text)]">
          {tr.noShowNoteLabel}
          <Textarea
            className="mt-1"
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </Modal>
    </div>
  );
}
