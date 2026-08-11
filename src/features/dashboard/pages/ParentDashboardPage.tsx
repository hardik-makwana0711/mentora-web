import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { fetchParentDashboard } from '@/services/dashboard.service';
import { fetchLessonsDashboard } from '@/services/lessons.service';
import { profileService } from '@/services/profile.service';
import { useAuthStore } from '@/app/store/authStore';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useUnreadMessageTotal } from '@/features/messages/hooks/useUnreadMessageTotal';
import { translateWelcomeMessage } from '@/lib/translate-dashboard';
import { WelcomeCard } from '@/features/dashboard/components/WelcomeCard';
import { StudentCard } from '@/features/dashboard/components/StudentCard';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';
import { UpcomingLessonCard } from '@/features/dashboard/components/UpcomingLessonCard';
import { DashboardEmptyState } from '@/features/dashboard/components/DashboardEmptyState';
import { WalletCard } from '@/features/dashboard/components/WalletCard';
import { QuickActionsGrid } from '@/features/dashboard/components/QuickActionsGrid';
import { ParentOverviewStats } from '@/features/dashboard/components/ParentOverviewStats';
import { DashboardSponsoredSection } from '@/features/marketing/components/DashboardSponsoredSection';
import { StudentFavouritesPanel } from '@/features/dashboard/components/StudentFavouritesPanel';
import { useDashboardJoin } from '@/features/dashboard/lib/use-dashboard-join';
import { useRefetchOnVisible } from '@/hooks/use-refetch-on-visible';
import type { JoinableSession } from '@/types/sessions';

export default function ParentDashboardPage() {
  const tr = useStrings();
  const roleBase = useRoleBase();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { goSession } = useDashboardJoin(roleBase);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: qk.parentDashboard,
    queryFn: fetchParentDashboard,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const lessonsQ = useQuery({
    queryKey: qk.lessonsDashboard('parent', undefined),
    queryFn: () => fetchLessonsDashboard('parent', {}),
    staleTime: 30_000,
  });

  const profileQ = useQuery({
    queryKey: user?.id ? qk.profile(user.id) : [...qk.profileScope, 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const unreadQ = useUnreadMessageTotal(true);

  useRefetchOnVisible(() => void refetch());

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState title={tr.dashboardLoadError} onRetry={() => void refetch()} />;
  }

  const lesson = data.upcoming_lesson;
  const upcomingCount = lessonsQ.isSuccess ? (lessonsQ.data.calendar?.length ?? 0) : null;
  const linkedCount = profileQ.isSuccess
    ? (profileQ.data.parent_profile?.linked_students?.length ?? 0)
    : null;
  const unreadMessages = unreadQ.isSuccess ? (unreadQ.data ?? 0) : null;

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <PageHeader
          title={tr.navDashboard}
          description={translateWelcomeMessage(data.account.welcome_message, data.account.parent_name)}
        />
      </motion.div>

      <div className="mt-6 flex flex-col gap-5">
        <ParentOverviewStats
          upcomingLessons={upcomingCount}
          creditBalance={data.wallet.credit_balance}
          unreadMessages={unreadMessages}
          linkedStudents={linkedCount}
          roleBase={roleBase}
        />

        <WelcomeCard
          name={data.account.parent_name}
          welcomeMessage={data.account.welcome_message}
          avatarUrl={data.account.avatar_url}
        />

        {lesson ? (
          <UpcomingLessonCard
            mentorName={lesson.mentor_name}
            subject={lesson.subject}
            studentName={data.student?.student_name}
            startTime={lesson.start_time}
            joinSession={{
              session_id: lesson.session_id,
              meeting_status: lesson.meeting_status,
              meeting_url: lesson.meeting_url,
              can_join: lesson.can_join,
              meeting_provider: lesson.meeting_provider,
            } satisfies JoinableSession}
            onViewPress={() => goSession(lesson.session_id)}
          />
        ) : (
          <DashboardEmptyState
            compact
            title={tr.noUpcomingLessons}
            description={tr.noUpcomingLessonsDescription}
            buttonText={tr.findMentor}
            onPress={() => navigate(`${roleBase}/search`)}
            secondaryButtonText={tr.lessonsViewPastLessons}
            onSecondaryPress={() => navigate(`${roleBase}/lessons?tab=past`)}
          />
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {data.student ? (
            <StudentCard
              studentName={data.student.student_name}
              grade={data.student.grade}
              avatarUrl={data.student.avatar_url}
            />
          ) : (
            <DashboardPanelCard>
              <p className="text-sm text-[var(--color-text-muted)]">{tr.linkedStudents}</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{tr.noLinkedChild}</p>
            </DashboardPanelCard>
          )}
          <WalletCard
            creditBalance={data.wallet.credit_balance}
            onAddCredits={() => navigate(`${roleBase}/wallet`)}
          />
        </div>

        {data.student ? (
          <StudentFavouritesPanel
            studentId={data.student.student_id}
            studentName={data.student.student_name}
          />
        ) : null}

        <QuickActionsGrid roleBase={roleBase} actions={data.quick_actions ?? []} />

        <DashboardSponsoredSection studentId={data.student?.student_id} />
      </div>
    </PageContainer>
  );
}
