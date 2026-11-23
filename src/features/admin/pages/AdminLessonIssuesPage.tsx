import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs, TabList, TabPanel, TabTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';
import { ReasonModal } from '@/features/admin/components/ReasonModal';
import { adminLessonsService } from '@/services/admin-lessons.service';
import { qk } from '@/constants/query-keys';
import { useStrings, type Strings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import type { SessionCancellationKind } from '@/types/lessons';
import type {
  AdminActiveLesson,
  AdminLessonIssue,
  LessonIssueKind,
  LessonIssueStatus,
} from '@/types/admin-lessons';

type Tab = 'issues' | 'active' | 'history';

function issueKindLabel(tr: Strings, kind: LessonIssueKind) {
  return kind === 'STUDENT_NO_SHOW' ? tr.adminIssueKindStudent : tr.adminIssueKindMentor;
}

function issueStatusLabel(tr: Strings, status: LessonIssueStatus) {
  if (status === 'OPEN') return tr.adminIssueStatusOpen;
  if (status === 'CONFIRMED') return tr.adminIssueStatusConfirmed;
  return tr.adminIssueStatusRejected;
}

function roleLabel(tr: Strings, role: string) {
  if (role === 'mentor') return tr.adminRoleMentor;
  if (role === 'parent') return tr.adminRoleParent;
  if (role === 'student') return tr.adminRoleStudent;
  if (role === 'admin') return tr.adminRoleAdmin;
  return role;
}

function cancelKindLabel(tr: Strings, kind: SessionCancellationKind | null) {
  switch (kind) {
    case 'PARENT_ON_TIME':
      return tr.adminKindParentOnTime;
    case 'PARENT_LATE':
      return tr.adminKindParentLate;
    case 'MENTOR':
      return tr.adminKindMentor;
    case 'STUDENT_NO_SHOW':
      return tr.adminIssueKindStudent;
    case 'MENTOR_NO_SHOW':
      return tr.adminIssueKindMentor;
    case 'ADMIN':
      return tr.adminKindAdmin;
    default:
      return '—';
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-[var(--color-text-secondary)]">
      <span className="font-medium text-[var(--color-m-text)]">{label}:</span> {value}
    </p>
  );
}

function LoadingBlock() {
  return (
    <div className="flex justify-center py-12">
      <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
    </div>
  );
}

// ── Missed-lesson reports ──────────────────────────────────────────────────

function IssuesPanel() {
  const tr = useStrings();
  const qc = useQueryClient();
  const locale = getDateFnsLocale();
  const [status, setStatus] = useState<LessonIssueStatus | ''>('OPEN');
  const [pending, setPending] = useState<{
    issue: AdminLessonIssue;
    decision: 'confirm' | 'reject';
  } | null>(null);

  const query = useQuery({
    queryKey: qk.adminLessonIssues({ status }),
    queryFn: () => adminLessonsService.listIssues(status || undefined),
  });

  const resolve = useMutation({
    mutationFn: (v: { reportId: string; decision: 'confirm' | 'reject'; note: string }) =>
      adminLessonsService.resolveIssue(v.reportId, v.decision, v.note || undefined),
    onSuccess: () => {
      toast.success(tr.adminIssueResolvedToast);
      setPending(null);
      void qc.invalidateQueries({ queryKey: ['admin', 'lesson-issues'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'lesson-cancellations'] });
    },
    onError: () => toast.error(tr.actionFailed),
  });

  const modalTitle = !pending
    ? ''
    : pending.decision === 'reject'
      ? tr.adminIssueRejectTitle
      : pending.issue.kind === 'STUDENT_NO_SHOW'
        ? tr.adminIssueConfirmStudentTitle
        : tr.adminIssueConfirmMentorTitle;

  return (
    <>
      <div className="mb-4 max-w-xs">
        <DropdownSelect
          value={status}
          onChange={(v) => setStatus(v as LessonIssueStatus | '')}
          options={[
            { value: 'OPEN', label: tr.adminIssueStatusOpen },
            { value: 'CONFIRMED', label: tr.adminIssueStatusConfirmed },
            { value: 'REJECTED', label: tr.adminIssueStatusRejected },
            { value: '', label: tr.adminFilterAllStatuses },
          ]}
        />
      </div>

      {query.isPending ? (
        <LoadingBlock />
      ) : query.isError ? (
        <ErrorState title={tr.loadError} onRetry={() => void query.refetch()} />
      ) : !query.data.length ? (
        <EmptyState title={tr.adminIssueEmpty} />
      ) : (
        <div className="space-y-4">
          {query.data.map((issue) => {
            const answer =
              issue.counterpart_response === 'agreed'
                ? tr.adminIssueAgreed
                : issue.counterpart_response === 'disputed'
                  ? tr.adminIssueDisputed
                  : tr.adminIssueNoAnswer;
            return (
              <Card key={issue.report_id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-[var(--color-m-text)]">
                      {issue.session.subject}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {format(new Date(issue.session.scheduled_at), 'PPp', { locale })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={issue.kind === 'MENTOR_NO_SHOW' ? 'danger' : 'warning'}>
                      {issueKindLabel(tr, issue.kind)}
                    </Badge>
                    <Badge
                      variant={
                        issue.status === 'OPEN'
                          ? 'info'
                          : issue.status === 'CONFIRMED'
                            ? 'success'
                            : 'default'
                      }
                    >
                      {issueStatusLabel(tr, issue.status)}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Row label={tr.adminRoleMentor} value={issue.session.mentor.name} />
                  <Row label={tr.adminRoleStudent} value={issue.session.student.name} />
                  <Row
                    label={tr.adminIssueReportedByLabel}
                    value={roleLabel(tr, issue.reporter_role)}
                  />
                  {issue.note ? <Row label={tr.adminIssueNoteLabel} value={issue.note} /> : null}
                  <Row
                    label={tr.adminIssueOtherSide}
                    value={
                      issue.counterpart_note ? `${answer} — ${issue.counterpart_note}` : answer
                    }
                  />
                  {issue.resolution_note ? (
                    <Row label={tr.adminIssueResolutionLabel} value={issue.resolution_note} />
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  {format(new Date(issue.created_at), 'PPp', { locale })}
                </p>
                {issue.status === 'OPEN' ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => setPending({ issue, decision: 'confirm' })}
                    >
                      {tr.adminIssueConfirm}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setPending({ issue, decision: 'reject' })}
                    >
                      {tr.adminIssueReject}
                    </Button>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <ReasonModal
        open={!!pending}
        title={modalTitle}
        confirmLabel={pending?.decision === 'reject' ? tr.adminIssueReject : tr.adminIssueConfirm}
        loading={resolve.isPending}
        required={false}
        onClose={() => setPending(null)}
        onConfirm={(note) =>
          pending &&
          resolve.mutate({ reportId: pending.issue.report_id, decision: pending.decision, note })
        }
      />
    </>
  );
}

// ── Emergency cancel ───────────────────────────────────────────────────────

function CancelModal({
  lesson,
  onClose,
}: {
  lesson: AdminActiveLesson | null;
  onClose: () => void;
}) {
  const tr = useStrings();
  const qc = useQueryClient();
  const [refundParent, setRefundParent] = useState(true);
  const [payMentor, setPayMentor] = useState(false);
  const [reason, setReason] = useState('');

  function close() {
    setRefundParent(true);
    setPayMentor(false);
    setReason('');
    onClose();
  }

  const cancel = useMutation({
    mutationFn: () =>
      adminLessonsService.cancel(lesson!.session_id, {
        refund_parent: refundParent,
        pay_mentor: payMentor,
        reason: reason.trim(),
      }),
    onSuccess: () => {
      toast.success(tr.adminCancelDoneToast);
      void qc.invalidateQueries({ queryKey: ['admin', 'lesson-active'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'lesson-cancellations'] });
      close();
    },
    onError: () => toast.error(tr.actionFailed),
  });

  const canSubmit = reason.trim().length >= 3 && !cancel.isPending;

  return (
    <Modal
      open={!!lesson}
      title={tr.adminCancelModalTitle}
      onClose={close}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close} disabled={cancel.isPending}>
            {tr.cancel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => cancel.mutate()}
            disabled={!canSubmit}
          >
            {cancel.isPending ? tr.loading : tr.adminCancelLesson}
          </Button>
        </div>
      }
    >
      {lesson ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <Row
              label={tr.adminLessonTime}
              value={format(new Date(lesson.scheduled_at), 'PPp', { locale: getDateFnsLocale() })}
            />
            <Row label={tr.adminRoleMentor} value={lesson.mentor.name} />
            <Row label={tr.adminRoleStudent} value={lesson.student.name} />
          </div>
          <div>
            <Checkbox
              name="refund_parent"
              label={tr.adminCancelRefundParent}
              checked={refundParent}
              onChange={(e) => setRefundParent(e.target.checked)}
            />
            <Checkbox
              name="pay_mentor"
              label={tr.adminCancelPayMentor}
              checked={payMentor}
              onChange={(e) => setPayMentor(e.target.checked)}
            />
          </div>
          <Textarea
            label={tr.adminCancelReasonLabel}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={tr.adminCancelReasonPlaceholder}
            rows={3}
            maxLength={500}
          />
        </div>
      ) : null}
    </Modal>
  );
}

function ActivePanel() {
  const tr = useStrings();
  const locale = getDateFnsLocale();
  const [draft, setDraft] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<AdminActiveLesson | null>(null);

  const query = useQuery({
    queryKey: qk.adminLessonActive({ q }),
    queryFn: () => adminLessonsService.listActive(q || undefined),
  });

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setQ(draft.trim());
  }

  return (
    <>
      <form onSubmit={onSearch} className="mb-4 flex max-w-xl flex-wrap items-start gap-2">
        <div className="min-w-[220px] flex-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={tr.adminActiveSearchPlaceholder}
            aria-label={tr.adminActiveSearchPlaceholder}
          />
        </div>
        <Button type="submit" variant="secondary">
          {tr.adminActiveSearch}
        </Button>
      </form>

      {query.isPending ? (
        <LoadingBlock />
      ) : query.isError ? (
        <ErrorState title={tr.loadError} onRetry={() => void query.refetch()} />
      ) : !query.data.length ? (
        <EmptyState title={tr.adminActiveEmpty} />
      ) : (
        <div className="space-y-3">
          {query.data.map((lesson) => (
            <Card
              key={lesson.session_id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-[var(--color-m-text)]">{lesson.subject}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {format(new Date(lesson.scheduled_at), 'PPp', { locale })}
                </p>
                <Row label={tr.adminRoleMentor} value={lesson.mentor.name} />
                <Row
                  label={tr.adminRoleStudent}
                  value={
                    lesson.parent
                      ? `${lesson.student.name} (${tr.adminRoleParent}: ${lesson.parent.name})`
                      : lesson.student.name
                  }
                />
              </div>
              <Button type="button" size="sm" variant="danger" onClick={() => setSelected(lesson)}>
                {tr.adminCancelLesson}
              </Button>
            </Card>
          ))}
        </div>
      )}

      <CancelModal lesson={selected} onClose={() => setSelected(null)} />
    </>
  );
}

// ── Cancellation history ───────────────────────────────────────────────────

function HistoryPanel() {
  const tr = useStrings();
  const locale = getDateFnsLocale();
  const query = useQuery({
    queryKey: qk.adminLessonCancellations(),
    queryFn: () => adminLessonsService.listCancellations(100),
  });

  if (query.isPending) return <LoadingBlock />;
  if (query.isError)
    return <ErrorState title={tr.loadError} onRetry={() => void query.refetch()} />;
  if (!query.data.length) return <EmptyState title={tr.adminHistoryEmpty} />;

  return (
    <div className="space-y-3">
      {query.data.map((row) => (
        <Card key={row.session_id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-[var(--color-m-text)]">{row.subject}</h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                {format(new Date(row.scheduled_at), 'PPp', { locale })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{cancelKindLabel(tr, row.cancellation_kind)}</Badge>
              <Badge variant={row.credit_refunded ? 'success' : 'default'}>
                {row.credit_refunded ? tr.adminHistoryRefunded : tr.adminHistoryNotRefunded}
              </Badge>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <Row label={tr.adminRoleMentor} value={row.mentor.name} />
            <Row label={tr.adminRoleStudent} value={row.student.name} />
            <Row
              label={tr.adminHistoryCancelledBy}
              value={
                row.cancelled_by
                  ? `${row.cancelled_by.name} (${roleLabel(tr, row.cancelled_by.role)})`
                  : '—'
              }
            />
            {row.cancellation_reason ? (
              <Row label={tr.adminIssueNoteLabel} value={row.cancellation_reason} />
            ) : null}
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            {format(new Date(row.cancelled_at), 'PPp', { locale })}
          </p>
        </Card>
      ))}
    </div>
  );
}

export default function AdminLessonIssuesPage() {
  const tr = useStrings();
  const [tab, setTab] = useState<Tab>('issues');

  return (
    <PageContainer>
      <PageHeader title={tr.adminNavLessonIssues} description={tr.adminLessonIssuesSubtitle} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabList className="w-fit max-w-full overflow-x-auto [&>button]:whitespace-nowrap">
          <TabTrigger value="issues">{tr.adminLessonTabReports}</TabTrigger>
          <TabTrigger value="active">{tr.adminLessonTabCancel}</TabTrigger>
          <TabTrigger value="history">{tr.adminLessonTabHistory}</TabTrigger>
        </TabList>
        <TabPanel value="issues">
          <IssuesPanel />
        </TabPanel>
        <TabPanel value="active">
          <ActivePanel />
        </TabPanel>
        <TabPanel value="history">
          <HistoryPanel />
        </TabPanel>
      </Tabs>
    </PageContainer>
  );
}
