import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LessonReportSections } from '@/features/lessons/components/LessonReportSections';
import { ParentLessonActions } from '@/features/lessons/components/ParentLessonActions';
import { TranscriptStatusBadge } from '@/features/lessons/components/ai/TranscriptStatusBadge';
import {
  formatLessonDate,
  formatLessonServiceName,
  formatLessonTime,
  sessionStatusLabel,
} from '@/features/lessons/lib/lessons-utils';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { useRefetchOnVisible } from '@/hooks/use-refetch-on-visible';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { fetchSessionDetail, fetchTranscriptStatus } from '@/services/lessons.service';
import type { LessonRole } from '@/types/lessons';

function resolveLessonRole(userRole: string | undefined): LessonRole {
  if (userRole === 'mentor' || userRole === 'student' || userRole === 'parent') return userRole;
  return 'student';
}

function statusCardVariant(kind: 'ok' | 'pending' | 'warn' | 'danger') {
  if (kind === 'ok') return 'success' as const;
  if (kind === 'warn') return 'warning' as const;
  if (kind === 'danger') return 'danger' as const;
  return 'default' as const;
}

export default function LessonReportPage() {
  const tr = useStrings();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const role = resolveLessonRole(user?.role);
  const isMentor = role === 'mentor';
  const isParent = role === 'parent';

  const detailQ = useQuery({
    queryKey: sessionId ? qk.sessionDetail(sessionId) : ['sessions', 'none'],
    queryFn: () => fetchSessionDetail(sessionId!),
    enabled: Boolean(sessionId),
    staleTime: 0,
  });

  const transcriptQ = useQuery({
    queryKey: sessionId ? qk.transcriptStatus(sessionId) : ['sessions', 'transcript-none'],
    queryFn: () => fetchTranscriptStatus(sessionId!),
    enabled: Boolean(sessionId),
    staleTime: 0,
  });

  const refreshReport = useCallback(async () => {
    if (!sessionId) return;
    await Promise.all([
      detailQ.refetch(),
      transcriptQ.refetch(),
      qc.invalidateQueries({ queryKey: qk.aiSummary(sessionId) }),
      qc.invalidateQueries({ queryKey: qk.aiQuizMentor(sessionId) }),
      qc.invalidateQueries({ queryKey: qk.aiQuizStudent(sessionId) }),
    ]);
    const quizId = detailQ.data?.ai_quiz_id;
    if (quizId) {
      await qc.invalidateQueries({ queryKey: qk.aiQuizResult(quizId) });
    }
  }, [detailQ, transcriptQ, qc, sessionId]);

  useRefetchOnVisible(() => {
    void refreshReport();
  });

  const d = detailQ.data;
  const transcriptStatus = transcriptQ.data?.transcriptStatus ?? null;

  const reportMeta = useMemo(() => {
    if (!d) return null;
    const status = (d.status ?? '').toLowerCase();
    const planned = status === 'scheduled' || status === 'rescheduled' || status === 'in_progress';
    const completed = status === 'completed';
    const summaryStatus = (d.ai_summary_status ?? '').toLowerCase();
    const quizStatus = (d.ai_quiz_status ?? '').toLowerCase();
    const hasNote = Boolean(d.mentor_note?.note_content);
    const summaryReady = summaryStatus === 'generated' || Boolean(d.ai_summary);
    const summaryFailed = summaryStatus === 'failed' || transcriptStatus === 'FAILED';
    const summaryProcessing =
      completed &&
      !summaryReady &&
      !summaryFailed &&
      (transcriptStatus == null ||
        transcriptStatus === 'SCHEDULED' ||
        transcriptStatus === 'IN_PROGRESS' ||
        transcriptStatus === 'NOT_SCHEDULED' ||
        summaryStatus === 'pending');

    const quizLabel = !quizStatus || quizStatus === 'quiz_not_generated' || quizStatus === 'draft'
      ? tr.reportStatusQuizNotAssigned
      : quizStatus === 'published' || quizStatus === 'generated'
        ? tr.reportStatusQuizAssigned
        : quizStatus === 'submitted'
          ? tr.reportStatusQuizCompleted
          : tr.reportStatusQuizNotAssigned;

    const summaryLabel = planned
      ? tr.reportStatusSummaryPending
      : summaryReady
        ? tr.reportStatusSummaryReady
        : summaryFailed
          ? tr.aiSummaryFailedTitle
          : tr.reportStatusSummaryProcessing;

    return {
      planned,
      completed,
      summaryReady,
      summaryFailed,
      summaryProcessing,
      lessonLabel: sessionStatusLabel(d.status),
      summaryLabel,
      quizLabel,
      mentorNoteLabel: hasNote ? tr.reportStatusMentorNoteAdded : tr.reportStatusMentorNoteMissing,
      summaryKind: (summaryReady ? 'ok' : summaryFailed ? 'danger' : 'pending') as
        | 'ok'
        | 'pending'
        | 'warn'
        | 'danger',
      quizKind: (quizStatus === 'submitted' ? 'ok' : quizStatus === 'published' ? 'warn' : 'pending') as
        | 'ok'
        | 'pending'
        | 'warn'
        | 'danger',
      noteKind: (hasNote ? 'ok' : 'pending') as 'ok' | 'pending' | 'warn' | 'danger',
      lessonKind: (completed ? 'ok' : planned ? 'pending' : status === 'cancelled' ? 'danger' : 'pending') as
        | 'ok'
        | 'pending'
        | 'warn'
        | 'danger',
    };
  }, [d, transcriptStatus, tr]);

  if (!sessionId) {
    return <ErrorState title={tr.invalidSession} onRetry={() => navigate(`${roleBase}/lessons`)} />;
  }

  if (detailQ.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (detailQ.isError || !d || !reportMeta) {
    return (
      <PageContainer width="content" className="max-w-7xl">
        <BackLink to={`${roleBase}/lessons`}>{tr.backToLessons}</BackLink>
        <ErrorState title={tr.lessonReportLoadError} onRetry={() => void refreshReport()} />
      </PageContainer>
    );
  }

  const subject = formatLessonServiceName(d.subject_name);
  const peopleLine = isMentor
    ? d.student_name
    : `${d.student_name} · ${d.mentor_name}`;

  return (
    <PageContainer width="content" className="max-w-7xl">
      <BackLink to={`${roleBase}/lessons`}>{tr.backToLessons}</BackLink>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <PageHeader title={tr.lessonReportTitle} description={subject} />
          <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">{peopleLine}</p>
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
            {formatLessonDate(d.scheduled_at)}
            {formatLessonTime(d.scheduled_at) ? ` · ${formatLessonTime(d.scheduled_at)}` : ''}
            {` · ${d.duration_minutes} ${tr.minutesUnit}`}
          </p>
          <div className="mt-2">
            <Badge variant={statusCardVariant(reportMeta.lessonKind)}>
              {reportMeta.lessonLabel}
            </Badge>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => void refreshReport()}
          disabled={detailQ.isFetching}
        >
          <RefreshCw className={`size-4 ${detailQ.isFetching ? 'animate-spin' : ''}`} />
          {tr.refreshList}
        </Button>
      </div>

      {reportMeta.planned ? (
        <div className="mb-6 rounded-xl border border-[var(--color-m-primary)]/25 bg-[var(--color-m-primary)]/10 px-4 py-3">
          <p className="text-sm font-semibold text-[var(--color-m-text)]">{tr.reportPlannedBannerTitle}</p>
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
            {tr.reportPlannedBannerDescription}
          </p>
        </div>
      ) : null}

      {reportMeta.summaryProcessing && !reportMeta.planned ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-[var(--color-m-text)]">
            {tr.reportProcessingBannerTitle}
          </p>
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
            {tr.reportProcessingBannerDescription}
          </p>
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: tr.reportStatusCardTranscript,
            value:
              transcriptStatus === 'READY'
                ? tr.reportStatusReady
                : transcriptStatus === 'NOT_SCHEDULED'
                  ? tr.reportStatusNone
                  : transcriptStatus === 'IN_PROGRESS' || transcriptStatus === 'SCHEDULED'
                    ? tr.reportStatusProcessing
                    : tr.reportStatusNone,
            kind:
              transcriptStatus === 'READY'
                ? ('ok' as const)
                : transcriptStatus === 'FAILED'
                  ? ('danger' as const)
                  : ('pending' as const),
          },
          {
            label: tr.reportStatusCardAiSummary,
            value: reportMeta.summaryLabel,
            kind: reportMeta.summaryKind,
          },
          {
            label: tr.reportStatusCardQuiz,
            value: reportMeta.quizLabel,
            kind: reportMeta.quizKind,
          },
          {
            label: tr.reportStatusCardMentorNote,
            value: reportMeta.mentorNoteLabel,
            kind: reportMeta.noteKind,
          },
          {
            // TODO: Wire real review status when session detail API exposes parent/student review.
            label: tr.reportStatusCardReview,
            value: tr.reportStatusNone,
            kind: 'pending' as const,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3"
          >
            <p className="text-xs font-medium text-[var(--color-m-text-muted)]">{card.label}</p>
            <div className="mt-2">
              <Badge variant={statusCardVariant(card.kind)}>{card.value}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,32%)] lg:items-start">
        <div className="min-w-0 space-y-4">
          <TranscriptStatusBadge transcriptStatus={transcriptStatus} role={role} />

          <LessonReportSections
            detail={d}
            role={role}
            transcriptStatus={transcriptStatus}
          />

          {isParent ? (
            <ParentLessonActions mentorId={d.mentor_id} studentId={d.student_id} />
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
            <h3 className="text-sm font-semibold text-[var(--color-m-text)]">{tr.lessonInfoTitle}</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.lessonInfoSubject}</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">{subject}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.lessonInfoStudent}</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">{d.student_name}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.lessonInfoMentor}</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">{d.mentor_name}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.lessonInfoDate}</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">
                  {formatLessonDate(d.scheduled_at)}
                  {formatLessonTime(d.scheduled_at) ? ` · ${formatLessonTime(d.scheduled_at)}` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.lessonInfoDuration}</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">
                  {d.duration_minutes} {tr.minutesUnit}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.lessonInfoStatus}</dt>
                <dd className="mt-1">
                  <Badge variant={statusCardVariant(reportMeta.lessonKind)}>
                    {reportMeta.lessonLabel}
                  </Badge>
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
