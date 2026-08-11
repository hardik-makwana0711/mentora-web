import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { endOfWeek, isWithinInterval, parseISO, startOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { fetchMentorDashboard } from '@/services/dashboard.service';
import { fetchMentorWalletMe } from '@/services/mentor-wallet.service';
import { listingsService } from '@/services/listings.service';
import { contactRequestsService } from '@/services/contact-requests.service';
import { materialsService } from '@/services/materials.service';
import { profileService } from '@/services/profile.service';
import { translateWelcomeMessage } from '@/lib/translate-dashboard';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { useUnreadMessageTotal } from '@/features/messages/hooks/useUnreadMessageTotal';
import { WelcomeCard } from '@/features/dashboard/components/WelcomeCard';
import { TodayScheduleList } from '@/features/dashboard/components/TodayScheduleList';
import { UpcomingLessonsList } from '@/features/dashboard/components/UpcomingLessonsList';
import { DashboardEmptyState } from '@/features/dashboard/components/DashboardEmptyState';
import { EarningsCard } from '@/features/dashboard/components/EarningsCard';
import { AvailabilityCard } from '@/features/dashboard/components/AvailabilityCard';
import { MentorOverviewStats } from '@/features/dashboard/components/MentorOverviewStats';
import { MentorWeekPreview } from '@/features/dashboard/components/MentorWeekPreview';
import { MentorQuickActions } from '@/features/dashboard/components/MentorQuickActions';
import {
  MentorPendingWork,
  type PendingWorkItem,
} from '@/features/dashboard/components/MentorPendingWork';
import { useRefetchOnVisible } from '@/hooks/use-refetch-on-visible';

export default function MentorDashboardPage() {
  const tr = useStrings();
  const roleBase = useRoleBase();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: qk.mentorDashboard,
    queryFn: fetchMentorDashboard,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const walletQ = useQuery({
    queryKey: qk.mentorWalletMe,
    queryFn: fetchMentorWalletMe,
    staleTime: 30_000,
  });

  const listingsQ = useQuery({
    queryKey: qk.mentorListings,
    queryFn: () => listingsService.fetchMyListings(),
    staleTime: 60_000,
  });

  const contactQ = useQuery({
    queryKey: qk.mentorContactRequests({ status: 'pending', limit: 50 }),
    queryFn: () => contactRequestsService.listMentorIncoming({ status: 'pending', limit: 50 }),
    staleTime: 30_000,
  });

  const materialsQ = useQuery({
    queryKey: qk.mentorMaterials('dashboard-pending'),
    queryFn: () => materialsService.getMentorMaterials({ status: 'active', type: 'assignment' }),
    staleTime: 60_000,
  });

  const profileQ = useQuery({
    queryKey: user?.id ? qk.profile(user.id) : [...qk.profileScope, 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const unreadQ = useUnreadMessageTotal(true);

  useRefetchOnVisible(() => void refetch());

  const weekCount = useMemo(() => {
    if (!data) return 0;
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const seen = new Set<string>();
    for (const item of [...data.today_schedule, ...data.upcoming_lessons]) {
      try {
        const start = parseISO(item.start_time);
        if (isWithinInterval(start, { start: weekStart, end: weekEnd })) {
          seen.add(item.session_id);
        }
      } catch {
        /* ignore bad dates */
      }
    }
    return seen.size;
  }, [data]);

  const pendingSubmissionCount = useMemo(() => {
    const materials = materialsQ.data ?? [];
    let pending = 0;
    for (const m of materials) {
      if (m.type !== 'assignment') continue;
      const assigned = m.assignedStudentCount ?? 0;
      const submitted = m.submissionCount ?? 0;
      if (assigned > submitted) pending += assigned - submitted;
    }
    return pending;
  }, [materialsQ.data]);

  const pendingItems = useMemo(() => {
    const items: PendingWorkItem[] = [];
    const requestCount = contactQ.data?.pagination?.total ?? contactQ.data?.items?.length ?? 0;
    if (contactQ.isSuccess && requestCount > 0) {
      items.push({
        id: 'contact-requests',
        label:
          requestCount === 1
            ? tr.dashboardPendingContactRequestOne
            : tr.dashboardPendingContactRequests.replace('{{count}}', String(requestCount)),
        href: `${roleBase}/contact-requests`,
      });
    }
    if (materialsQ.isSuccess && pendingSubmissionCount > 0) {
      items.push({
        id: 'submissions',
        label:
          pendingSubmissionCount === 1
            ? tr.dashboardPendingSubmissionOne
            : tr.dashboardPendingSubmissions.replace('{{count}}', String(pendingSubmissionCount)),
        href: `${roleBase}/materials`,
      });
    }
    const mentorProfile = profileQ.data?.mentor_profile;
    if (mentorProfile?.has_pending_profile_revision) {
      items.push({
        id: 'profile-revision',
        label: tr.dashboardPendingProfileRevision,
        href: `${roleBase}/profile`,
      });
    }
    // TODO: Add pending lesson-report items when dashboard/lessons API exposes reports-pending count.
    return items;
  }, [
    contactQ.data,
    contactQ.isSuccess,
    materialsQ.isSuccess,
    pendingSubmissionCount,
    profileQ.data,
    roleBase,
    tr,
  ]);

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

  const goSession = (sessionId: string) => {
    navigate(`${roleBase}/lessons/session/${sessionId}`);
  };

  const activeListings =
    listingsQ.data?.filter((l) => l.status === 'active').length ?? null;
  const pendingRequests =
    contactQ.isSuccess
      ? (contactQ.data.pagination?.total ?? contactQ.data.items?.length ?? 0)
      : null;
  const unreadMessages = unreadQ.isSuccess ? (unreadQ.data ?? 0) : null;
  const wallet = walletQ.data?.wallet;
  const availablePayout = wallet?.availableBalance ?? null;
  const pendingBalance = wallet?.pendingBalance ?? null;
  const currency = wallet?.currency ?? 'TRY';

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <PageHeader
          title={tr.navDashboard}
          description={translateWelcomeMessage(data.account.welcome_message, data.account.mentor_name)}
        />
      </motion.div>

      <div className="mt-6 flex flex-col gap-5">
        <MentorOverviewStats
          todayLessons={data.today_schedule.length}
          pendingRequests={pendingRequests}
          activeListings={listingsQ.isSuccess ? activeListings : null}
          unreadMessages={unreadMessages}
          availablePayout={walletQ.isSuccess ? availablePayout : null}
          currency={currency}
          roleBase={roleBase}
        />

        <WelcomeCard
          name={data.account.mentor_name}
          welcomeMessage={data.account.welcome_message}
          avatarUrl={data.account.avatar_url}
        />

        <MentorWeekPreview todayCount={data.today_schedule.length} weekCount={weekCount} />

        {data.today_schedule.length > 0 ? (
          <TodayScheduleList items={data.today_schedule} onSessionPress={goSession} />
        ) : (
          <DashboardEmptyState
            compact
            title={tr.dashboardNoScheduleToday}
            description={tr.dashboardNoScheduleTodayHint}
            buttonText={tr.dashboardViewLessons}
            onPress={() => navigate(`${roleBase}/lessons`)}
            secondaryButtonText={tr.dashboardSetAvailability}
            onSecondaryPress={() => navigate(`${roleBase}/availability`)}
          />
        )}

        <UpcomingLessonsList items={data.upcoming_lessons} onSessionPress={goSession} />

        <MentorPendingWork items={pendingItems} />

        <div className="grid gap-5 sm:grid-cols-2">
          <EarningsCard
            today={data.earnings.today}
            week={data.earnings.week}
            month={data.earnings.month}
            availablePayout={walletQ.isSuccess ? availablePayout : null}
            pendingBalance={walletQ.isSuccess ? pendingBalance : null}
            currency={currency}
          />
          <AvailabilityCard
            openSlots={data.availability.open_slots}
            bookedSlots={data.availability.booked_slots}
            // TODO: Hide until availability API returns next available slot time.
            nextAvailableTime={null}
          />
        </div>

        <MentorQuickActions roleBase={roleBase} />
      </div>
    </PageContainer>
  );
}
