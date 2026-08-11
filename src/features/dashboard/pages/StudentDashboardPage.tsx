import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { fetchStudentDashboard } from '@/services/dashboard.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { translateWelcomeMessage } from '@/lib/translate-dashboard';
import { WelcomeCard } from '@/features/dashboard/components/WelcomeCard';
import { UpcomingLessonCard } from '@/features/dashboard/components/UpcomingLessonCard';
import { DashboardEmptyState } from '@/features/dashboard/components/DashboardEmptyState';
import { QuickActionsGrid } from '@/features/dashboard/components/QuickActionsGrid';
import { DashboardSponsoredSection } from '@/features/marketing/components/DashboardSponsoredSection';
import { useDashboardJoin } from '@/features/dashboard/lib/use-dashboard-join';
import { useRefetchOnVisible } from '@/hooks/use-refetch-on-visible';
import type { JoinableSession } from '@/types/sessions';

export default function StudentDashboardPage() {
  const tr = useStrings();
  const roleBase = useRoleBase();
  const navigate = useNavigate();
  const { goSession } = useDashboardJoin(roleBase);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: qk.studentDashboard,
    queryFn: fetchStudentDashboard,
    staleTime: 0,
    refetchOnMount: 'always',
  });

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

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <PageHeader
          title={tr.navDashboard}
          description={translateWelcomeMessage(data.account.welcome_message, data.account.student_name)}
        />
      </motion.div>

      <div className="mt-6 flex flex-col gap-5">
        <WelcomeCard
          name={data.account.student_name}
          welcomeMessage={data.account.welcome_message}
          avatarUrl={data.account.avatar_url}
        />

        {lesson ? (
          <UpcomingLessonCard
            mentorName={lesson.mentor_name}
            subject={lesson.subject}
            lessonTopic={lesson.lesson_topic}
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
            title={tr.noUpcomingLessons}
            description={tr.noUpcomingLessonsDescription}
            buttonText={tr.findMentor}
            onPress={() => navigate(`${roleBase}/search`)}
          />
        )}

        <QuickActionsGrid roleBase={roleBase} actions={data.quick_actions ?? []} />

        <DashboardSponsoredSection />
      </div>
    </PageContainer>
  );
}
