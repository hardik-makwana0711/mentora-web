import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Tabs, TabList, TabPanel, TabTrigger } from '@/components/ui/Tabs';
import { UpcomingLessonsTab } from '@/features/lessons/components/UpcomingLessonsTab';
import { PastLessonsTab } from '@/features/lessons/components/PastLessonsTab';
import { LessonsSummaryCards } from '@/features/lessons/components/LessonsSummaryCards';
import { StudentFilterSelect } from '@/features/lessons/components/StudentFilterSelect';
import {
  computeLessonsSummaryStats,
  pastGroupsFromDashboard,
} from '@/features/lessons/lib/lessons-utils';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import { enrichCalendarWithUpcoming } from '@/features/lessons/lib/enrich-sessions';
import { useRefetchOnVisible } from '@/hooks/use-refetch-on-visible';
import { fetchLessonsDashboard } from '@/services/lessons.service';
import { fetchUpcomingSessions } from '@/services/sessions.service';
import { profileService } from '@/services/profile.service';
import type { LessonCalendarSession, LessonRole, PastGroupCard } from '@/types/lessons';

function isLessonRole(r: string | undefined): r is LessonRole {
  return r === 'mentor' || r === 'student' || r === 'parent';
}

export default function LessonsHomePage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const lessonRole = isLessonRole(role) ? role : null;
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = searchParams.get('studentId') ?? undefined;
  const resolvedTab = searchParams.get('tab') === 'past' ? 'past' : 'upcoming';

  const dashQ = useQuery({
    queryKey: lessonRole ? qk.lessonsDashboard(lessonRole, studentId) : ['lessons', 'none'],
    queryFn: () => fetchLessonsDashboard(lessonRole!, { studentId }),
    enabled: Boolean(lessonRole),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const upcomingQ = useQuery({
    queryKey: qk.sessionsUpcoming,
    queryFn: fetchUpcomingSessions,
    enabled: Boolean(lessonRole),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 2,
  });

  const profileQ = useQuery({
    queryKey: user?.id ? qk.profile(user.id) : ['profile', 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(user?.id) && lessonRole === 'parent',
  });

  const refetchLessons = () => {
    void dashQ.refetch();
    void upcomingQ.refetch();
  };

  useRefetchOnVisible(refetchLessons);

  const linkedStudents =
    dashQ.data && 'linked_students' in dashQ.data ? dashQ.data.linked_students : undefined;

  const studentsWithGrade = useMemo(() => {
    const grades = new Map(
      (profileQ.data?.parent_profile?.linked_students ?? []).map((s) => [s.id, s.grade_level ?? null])
    );
    return (linkedStudents ?? []).map((s) => ({
      student_id: s.student_id,
      student_name: s.student_name,
      grade_level: grades.get(s.student_id) ?? null,
    }));
  }, [linkedStudents, profileQ.data]);

  const calendar = useMemo(() => {
    const items = dashQ.data?.calendar ?? [];
    const filtered =
      studentId && lessonRole === 'parent'
        ? items.filter((s) => s.student_id === studentId)
        : items;
    return enrichCalendarWithUpcoming(filtered, upcomingQ.data ?? []);
  }, [dashQ.data, upcomingQ.data, studentId, lessonRole]);

  const pastGroups = useMemo(() => {
    if (!dashQ.data || !lessonRole) return [];
    let groups = pastGroupsFromDashboard(lessonRole, dashQ.data);
    if (studentId && lessonRole === 'parent') {
      groups = groups.filter((g) => 'student_id' in g && g.student_id === studentId);
    }
    return groups;
  }, [dashQ.data, lessonRole, studentId]);

  const summaryStats = useMemo(
    () => computeLessonsSummaryStats({ upcomingSessions: calendar, pastGroups }),
    [calendar, pastGroups]
  );

  if (!lessonRole) {
    return (
      <PageContainer width="content">
        <PageHeader title={tr.lessons} description="" />
        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.lessonsRoleRestricted}</p>
      </PageContainer>
    );
  }

  if (dashQ.isPending) {
    return (
      <PageContainer width="content">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <PageHeader title={tr.lessons} description={tr.loading} />
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      </PageContainer>
    );
  }

  if (dashQ.isError || !dashQ.data) {
    return (
      <PageContainer width="content">
        <PageHeader title={tr.lessons} description="" />
        <ErrorState title={tr.lessonsLoadError} onRetry={refetchLessons} />
      </PageContainer>
    );
  }

  const goSession = (session: LessonCalendarSession) => {
    navigate(`${roleBase}/lessons/session/${session.session_id}`);
  };

  const goPastGroup = (group: PastGroupCard) => {
    navigate(`${roleBase}/lessons/${group.lesson_id}/history`, {
      state: { group },
    });
  };

  const handleMessage = (session: LessonCalendarSession) => {
    const params = new URLSearchParams();
    const recipientId = lessonRole === 'mentor' ? session.student_id : session.mentor_id;
    if (recipientId) params.set('participantId', recipientId);
    navigate(`${roleBase}/messages${params.toString() ? `?${params}` : ''}`);
  };

  const showStudentFilter =
    lessonRole === 'parent' && studentsWithGrade.length > 1;

  const setActiveTab = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'upcoming') params.delete('tab');
    else params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  const setStudentFilter = (v: string) => {
    const next = new URLSearchParams(searchParams);
    if (v) next.set('studentId', v);
    else next.delete('studentId');
    setSearchParams(next);
  };

  return (
    <PageContainer width="content" className="max-w-7xl">
      <PageHeader
        title={tr.lessons}
        description={
          lessonRole === 'mentor' ? tr.lessonsPageDescriptionMentor : tr.lessonsPageDescription
        }
      />

      <LessonsSummaryCards stats={summaryStats} role={lessonRole} className="mb-6" />

      <Tabs value={resolvedTab} onValueChange={setActiveTab}>
        <div
          className={cn(
            'mb-6 flex flex-col gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-3 py-3 ring-1 ring-[var(--color-m-ring-subtle)] sm:flex-row sm:items-end sm:gap-4 sm:px-4'
          )}
        >
          {showStudentFilter ? (
            <div className="min-w-0 w-full sm:max-w-xs sm:flex-1">
              <StudentFilterSelect
                value={studentId ?? ''}
                onChange={setStudentFilter}
                students={studentsWithGrade}
              />
            </div>
          ) : null}

          {/* TODO: Wire subject/service, mentor, and date-range filters when dashboard API supports them. */}

          <TabList
            className={cn(
              'w-full shrink-0 sm:ml-auto sm:w-auto sm:min-w-[260px]',
              !showStudentFilter && 'sm:max-w-md'
            )}
          >
            <TabTrigger value="upcoming">{tr.lessonsTabUpcoming}</TabTrigger>
            <TabTrigger value="past">{tr.lessonsTabPast}</TabTrigger>
          </TabList>
        </div>
        <TabPanel value="upcoming">
          <UpcomingLessonsTab
            sessions={calendar}
            role={lessonRole}
            onSessionPress={goSession}
            onMessage={handleMessage}
            onViewPast={() => setActiveTab('past')}
          />
        </TabPanel>
        <TabPanel value="past">
          <PastLessonsTab
            groups={pastGroups}
            role={lessonRole}
            onGroupPress={goPastGroup}
            onViewUpcoming={() => setActiveTab('upcoming')}
          />
        </TabPanel>
      </Tabs>
    </PageContainer>
  );
}
