import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LessonCard } from '@/features/lessons/components/LessonCard';
import {
  formatLessonServiceName,
  pastGroupTitle,
  sessionStatusLabel,
  shouldShowReportCta,
} from '@/features/lessons/lib/lessons-utils';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { fetchLessonSessions } from '@/services/lessons.service';
import type { LessonRole, LessonSessionListItem, PastGroupCard } from '@/types/lessons';

function isLessonRole(r: string | undefined): r is LessonRole {
  return r === 'mentor' || r === 'student' || r === 'parent';
}

function partitionSessions(sessions: LessonSessionListItem[]) {
  const upcoming: LessonSessionListItem[] = [];
  const completed: LessonSessionListItem[] = [];
  const cancelled: LessonSessionListItem[] = [];
  for (const s of sessions) {
    const status = (s.badge ?? '').toLowerCase();
    if (status === 'cancelled') cancelled.push(s);
    else if (status === 'completed') completed.push(s);
    else upcoming.push(s);
  }
  return { upcoming, completed, cancelled };
}

export default function LessonSessionsPage() {
  const tr = useStrings();
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const location = useLocation();
  const group = (location.state as { group?: PastGroupCard } | null)?.group;
  const user = useAuthStore((s) => s.user);
  const lessonRole = isLessonRole(user?.role) ? user.role : 'student';

  const pastQ = useQuery({
    queryKey: lessonId ? qk.lessonSessions(lessonId, 'past', 1) : ['lessons', 'sessions', 'none'],
    queryFn: () => fetchLessonSessions(lessonId!, 'past', 1, 50),
    enabled: Boolean(lessonId),
  });

  const upcomingQ = useQuery({
    queryKey: lessonId ? qk.lessonSessions(lessonId, 'upcoming', 1) : ['lessons', 'sessions', 'up-none'],
    queryFn: () => fetchLessonSessions(lessonId!, 'upcoming', 1, 50),
    enabled: Boolean(lessonId),
  });

  const meta = pastQ.data ?? upcomingQ.data;
  const title = group
    ? formatLessonServiceName(pastGroupTitle(group, lessonRole))
    : formatLessonServiceName(meta?.subject_name) || tr.lessonsTabPast;

  const allSessions = useMemo(() => {
    const map = new Map<string, LessonSessionListItem>();
    for (const s of [...(upcomingQ.data?.sessions ?? []), ...(pastQ.data?.sessions ?? [])]) {
      map.set(s.session_id, s);
    }
    return [...map.values()].sort(
      (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    );
  }, [pastQ.data, upcomingQ.data]);

  const { upcoming, completed, cancelled } = useMemo(
    () => partitionSessions(allSessions),
    [allSessions]
  );

  const totalCompletedMinutes = completed.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);

  const studentName =
    meta?.student_name ?? ('student_name' in (group ?? {}) ? (group as { student_name: string }).student_name : '');
  const mentorName =
    meta?.mentor_name ?? ('mentor_name' in (group ?? {}) ? (group as { mentor_name: string }).mentor_name : '');
  const mentorId = meta?.mentor_id;
  const studentId = meta?.student_id;

  const pageStateBanner = useMemo(() => {
    if (upcoming.length > 0 && completed.length === 0) {
      return {
        title: tr.lessonGroupPlannedEmptyTitle,
        description: tr.lessonGroupPlannedEmptyDescription,
      };
    }
    if (completed.length > 0 && upcoming.length === 0) {
      return {
        title: tr.lessonGroupCompletedNoReportTitle,
        description: tr.lessonGroupCompletedNoReportDescription,
      };
    }
    if (cancelled.length > 0 && upcoming.length === 0 && completed.length === 0) {
      return { title: tr.lessonGroupCancelledTitle, description: '' };
    }
    return null;
  }, [upcoming.length, completed.length, cancelled.length, tr]);

  if (!lessonId) {
    return <ErrorState title={tr.invalidLesson} onRetry={() => navigate(`${roleBase}/lessons`)} />;
  }

  if (pastQ.isPending || upcomingQ.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if ((pastQ.isError && upcomingQ.isError) || !meta) {
    return (
      <PageContainer width="content" className="max-w-7xl">
        <BackLink to={`${roleBase}/lessons`}>{tr.backToLessons}</BackLink>
        <ErrorState title={tr.lessonSessionsLoadError} onRetry={() => void pastQ.refetch()} />
      </PageContainer>
    );
  }

  const goReport = (session: LessonSessionListItem) => {
    navigate(`${roleBase}/lessons/session/${session.session_id}/report`);
  };

  const goDetail = (session: LessonSessionListItem) => {
    navigate(`${roleBase}/lessons/session/${session.session_id}`);
  };

  const goMessage = () => {
    const params = new URLSearchParams();
    const participantId = lessonRole === 'mentor' ? studentId : mentorId;
    if (participantId) params.set('participantId', participantId);
    navigate(`${roleBase}/messages${params.toString() ? `?${params}` : ''}`);
  };

  const renderSessionList = (items: LessonSessionListItem[], emptyTitle: string, emptyDesc?: string) => {
    if (!items.length) {
      return (
        <div className="rounded-xl border border-dashed border-[var(--color-m-card-border)] px-4 py-6 text-center">
          <p className="text-sm font-medium text-[var(--color-m-text)]">{emptyTitle}</p>
          {emptyDesc ? (
            <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{emptyDesc}</p>
          ) : null}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {items.map((session) => {
          const cta = shouldShowReportCta(session.badge);
          return (
            <LessonCard
              key={session.session_id}
              session={session}
              role={lessonRole}
              variant={session.badge?.toLowerCase() === 'completed' ? 'past' : 'past'}
              onPress={() => goDetail(session)}
              onReport={cta !== 'hide' ? () => goReport(session) : undefined}
            />
          );
        })}
      </div>
    );
  };

  return (
    <PageContainer width="content" className="max-w-7xl">
      <BackLink to={`${roleBase}/lessons`}>{tr.backToLessons}</BackLink>
      <PageHeader
        title={title}
        description={[studentName, mentorName].filter(Boolean).join(' · ')}
      />

      {pageStateBanner ? (
        <div className="mb-6 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--color-m-text)]">{pageStateBanner.title}</p>
          {pageStateBanner.description ? (
            <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{pageStateBanner.description}</p>
          ) : null}
        </div>
      ) : null}

      {allSessions.length === 0 ? (
        <EmptyState
          title={tr.noPastSessions}
          description={tr.lessonGroupPlannedEmptyDescription}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,32%)] lg:items-start">
          <div className="space-y-8">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                  {tr.lessonGroupUpcomingSection}
                </h2>
                <Badge>{upcoming.length}</Badge>
              </div>
              {renderSessionList(
                upcoming,
                tr.lessonGroupPlannedEmptyTitle,
                tr.lessonGroupPlannedEmptyDescription
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                  {tr.lessonGroupCompletedSection}
                </h2>
                <Badge variant="success">{completed.length}</Badge>
              </div>
              {renderSessionList(
                completed,
                tr.lessonGroupCompletedNoReportTitle,
                tr.lessonGroupCompletedNoReportDescription
              )}
            </section>

            {cancelled.length > 0 ? (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                    {tr.lessonGroupCancelledSection}
                  </h2>
                  <Badge variant="danger">{cancelled.length}</Badge>
                </div>
                {renderSessionList(cancelled, tr.lessonGroupCancelledTitle)}
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 ring-1 ring-[var(--color-m-ring-subtle)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                {tr.lessonInfoTitle}
              </p>
              <dl className="mt-3 space-y-3 text-sm">
                {studentName ? (
                  <div>
                    <dt className="text-[var(--color-m-text-muted)]">{tr.lessonGroupSidebarStudent}</dt>
                    <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">{studentName}</dd>
                  </div>
                ) : null}
                {mentorName ? (
                  <div>
                    <dt className="text-[var(--color-m-text-muted)]">{tr.lessonGroupSidebarMentor}</dt>
                    <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">{mentorName}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[var(--color-m-text-muted)]">{tr.lessonGroupSidebarSubject}</dt>
                  <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">{title}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-m-text-muted)]">{tr.lessonGroupTotalSessions}</dt>
                  <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">{allSessions.length}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-m-text-muted)]">{tr.lessonGroupTotalCompletedTime}</dt>
                  <dd className="mt-0.5 font-medium text-[var(--color-m-text)]">
                    {totalCompletedMinutes} {tr.minutesUnit}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 ring-1 ring-[var(--color-m-ring-subtle)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                {tr.lessonGroupQuickActions}
              </p>
              <div className="flex flex-col gap-2">
                {(lessonRole === 'mentor' ? studentId : mentorId) ? (
                  <Button type="button" variant="secondary" size="sm" onClick={goMessage}>
                    <MessageCircle className="size-4" />
                    {tr.messageButton}
                  </Button>
                ) : null}
                {lessonRole === 'parent' ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`${roleBase}/search`)}
                    >
                      {tr.requestNewLesson}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `${roleBase}/materials${studentId ? `?studentId=${studentId}` : ''}`
                        )
                      }
                    >
                      {tr.viewMaterials}
                    </Button>
                  </>
                ) : null}
                {upcoming[0] ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => goDetail(upcoming[0])}
                  >
                    {tr.lessonsViewDetails}
                  </Button>
                ) : null}
                {completed[0] ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => goReport(completed[0])}
                  >
                    {tr.viewReport}
                  </Button>
                ) : null}
              </div>
              {upcoming[0] ? (
                <p className="mt-3 text-xs text-[var(--color-m-text-muted)]">
                  {sessionStatusLabel(upcoming[0].badge)} · {tr.reportStatusWaitingLesson}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      )}
    </PageContainer>
  );
}
